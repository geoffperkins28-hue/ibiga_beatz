"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "./supabase/server";
import { getCurrentUser } from "./auth";
import {
  notifyProducer,
  notifyCustomer,
  requestEmail,
  bookingEmail,
  customerRequestEmail,
  customerBookingEmail,
  orderEmail,
  customerOrderEmail,
  orderFulfilledEmail,
} from "./notify";
import type { ProducerProfile } from "./types";

const MEDIA_BUCKET = "media";
const DELIVERABLES_BUCKET = "deliverables";

/** Returns true when an authenticated producer is making the request. */
async function isAuthed(): Promise<boolean> {
  return Boolean(await getCurrentUser());
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  /** true when Supabase isn't configured yet and the submit was a no-op */
  demo?: boolean;
}

export interface AntiSpam {
  /** honeypot field — bots fill it, humans never see it */
  hp?: string;
  /** ms between form mount and submit — too fast = bot */
  elapsedMs?: number;
}

/**
 * Returns true if a public submission looks like a bot (silently drop it).
 * The honeypot is the reliable signal; the time-trap is deliberately lenient
 * (browser autofill can legitimately fill a short form in ~1s) so it never
 * silently swallows a real booking/request.
 */
function looksLikeBot(guard?: AntiSpam): boolean {
  if (!guard) return false;
  if (guard.hp && guard.hp.trim() !== "") return true;
  if (typeof guard.elapsedMs === "number" && guard.elapsedMs < 800) return true;
  return false;
}

export interface CustomRequestInput {
  name: string;
  email: string;
  phone: string;
  genre: string;
  bpm: string;
  mood: string;
  refArtist: string;
  deadline: string;
  budget: string;
  notes: string;
  voiceUrl?: string;
}

export async function submitCustomRequest(
  input: CustomRequestInput,
  guard?: AntiSpam
): Promise<ActionResult> {
  // Pretend success for bots so they don't retry, but write nothing.
  if (looksLikeBot(guard)) return { ok: true };
  if (!input.name.trim() || !input.email.trim()) {
    return { ok: false, error: "Name and email are required." };
  }

  const sb = getSupabaseServer();
  if (!sb) {
    // Supabase not wired up yet — accept the submission as a demo so the UI
    // flow works. Hook up the env vars + tables and this will persist.
    return { ok: true, demo: true };
  }

  const { error } = await sb.from("custom_requests").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    genre: input.genre || null,
    bpm: input.bpm ? Number(input.bpm) : null,
    mood: input.mood || null,
    ref_artist: input.refArtist || null,
    deadline: input.deadline || null,
    budget: input.budget || null,
    notes: input.notes || null,
    voice_url: input.voiceUrl || null,
    status: "New",
  });

  if (error) return { ok: false, error: error.message };
  await Promise.all([
    notifyProducer(
      `New custom request — ${input.name}`,
      requestEmail({
        name: input.name,
        email: input.email,
        genre: input.genre,
        bpm: input.bpm,
        budget: input.budget,
        notes: input.notes,
        voiceUrl: input.voiceUrl,
      })
    ),
    notifyCustomer(
      input.email,
      "We received your custom beat request — Ibiga Beatz",
      customerRequestEmail({ name: input.name, genre: input.genre, bpm: input.bpm, budget: input.budget })
    ),
  ]);
  return { ok: true };
}

// ── Producer profile ─────────────────────────────────────────────────────────

export async function updateProfile(
  input: ProducerProfile
): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const { error } = await sb
    .from("producer_profile")
    .update({
      display_name: input.displayName,
      full_name: input.fullName,
      role: input.role,
      tagline: input.tagline,
      bio: input.bio,
      avatar_url: input.avatarUrl || null,
      hero_image_url: input.heroImageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default");

  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export interface SignedUploadResult {
  path?: string;
  token?: string;
  publicUrl?: string;
  error?: string;
}

/**
 * Mints a short-lived signed upload URL so the browser can upload a file
 * directly to Supabase Storage. Keeps the file out of the Server Action body
 * (Vercel caps that at ~4.5 MB) while still requiring an authenticated producer.
 */
export async function createSignedUpload(
  folder: string,
  filename: string
): Promise<SignedUploadResult> {
  if (!(await isAuthed())) return { error: "Not authorized." };

  const sb = getSupabaseServer();
  if (!sb) return { error: "Storage isn't configured yet." };

  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "") || "misc";
  const ext = (filename.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "").toLowerCase();
  if (safeFolder === "beats/audio" && ext !== "mp3") {
    return { error: "Beat audio must be an MP3 file." };
  }
  const path = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await sb.storage
    .from(MEDIA_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not start upload." };

  const { data: pub } = sb.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path: data.path, token: data.token, publicUrl: pub.publicUrl };
}

/**
 * Public (no-auth) signed upload for a visitor's voice idea on the custom-request
 * form. Locked to the `requests/voice/` folder; the form's honeypot + audio-only
 * client validation bound abuse.
 */
const VOICE_EXTS = new Set(["webm", "mp3", "m4a", "mp4", "wav", "ogg", "aac"]);

export async function createVoiceUpload(
  filename: string
): Promise<SignedUploadResult> {
  const sb = getSupabaseServer();
  if (!sb) return { error: "Storage isn't configured yet." };

  const ext = (filename.split(".").pop() || "webm").replace(/[^a-z0-9]/gi, "").toLowerCase();
  // Server-side allowlist: this endpoint is unauthenticated, so only accept
  // audio containers into the locked-down requests/voice/ folder.
  if (!VOICE_EXTS.has(ext)) return { error: "Only audio recordings are allowed." };
  const path = `requests/voice/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await sb.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not start upload." };

  const { data: pub } = sb.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path: data.path, token: data.token, publicUrl: pub.publicUrl };
}

/**
 * Auth-guarded signed upload into the PRIVATE `deliverables` bucket — the clean
 * file a buyer receives after purchase. Returns only the storage path (no public
 * URL); downloads are always short-lived signed URLs minted at fulfilment time.
 */
export async function createDeliverableUpload(
  filename: string
): Promise<SignedUploadResult> {
  if (!(await isAuthed())) return { error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { error: "Storage isn't configured yet." };

  const ext = (filename.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await sb.storage
    .from(DELIVERABLES_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not start upload." };
  return { path: data.path, token: data.token };
}

// ── Beats management ─────────────────────────────────────────────────────────

export interface BeatInput {
  title: string;
  genre: string;
  bpm: string;
  mood: string;
  price: string;
  duration: string;
  image: string;
  audioUrl: string;
  key: string;
  notes: string;
  deliverablePath: string;
}

export async function createBeat(input: BeatInput): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const row = {
    title: input.title,
    genre: input.genre || "Afrobeats",
    bpm: input.bpm ? Number(input.bpm) : 0,
    mood: input.mood || null,
    price: input.price ? Number(input.price) : 0,
    duration: input.duration || null,
    image: input.image || null,
    audio_url: input.audioUrl || null,
    key: input.key || null,
    notes: input.notes || null,
    deliverable_path: input.deliverablePath || null,
    plays: 0,
  };
  const { error } = await insertWithNewColsFallback(sb, row);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** True when a write failed only because a newer migration (0004/0005) isn't applied yet. */
function isMissingNewCols(msg?: string): boolean {
  return Boolean(msg && /schema cache|column/i.test(msg) && /\bkey\b|\bnotes\b|deliverable_path/i.test(msg));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function stripNewCols(row: any) {
  const { key, notes, deliverable_path, ...rest } = row;
  void key; void notes; void deliverable_path;
  return rest;
}

async function insertWithNewColsFallback(sb: any, row: any) {
  const res = await sb.from("beats").insert(row);
  if (res.error && isMissingNewCols(res.error.message)) {
    return sb.from("beats").insert(stripNewCols(row));
  }
  return res;
}

async function updateWithNewColsFallback(sb: any, id: string, row: any) {
  const res = await sb.from("beats").update(row).eq("id", id);
  if (res.error && isMissingNewCols(res.error.message)) {
    return sb.from("beats").update(stripNewCols(row)).eq("id", id);
  }
  return res;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function updateBeat(id: string, input: BeatInput): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const { error } = await updateWithNewColsFallback(sb, id, {
    title: input.title,
    genre: input.genre || "Afrobeats",
    bpm: input.bpm ? Number(input.bpm) : 0,
    mood: input.mood || null,
    price: input.price ? Number(input.price) : 0,
    duration: input.duration || null,
    image: input.image || null,
    audio_url: input.audioUrl || null,
    key: input.key || null,
    notes: input.notes || null,
    deliverable_path: input.deliverablePath || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteBeat(id: string): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb.from("beats").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setBeatSold(id: string, sold: boolean): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb.from("beats").update({ sold }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Productions (songs) management ───────────────────────────────────────────

export interface SongInput {
  title: string;
  artist: string;
  cover: string;
  platform: string;
  link: string;
  year: string;
}

export async function createSong(input: SongInput): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  if (!input.title.trim() || !input.link.trim()) {
    return { ok: false, error: "Title and streaming link are required." };
  }
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const { error } = await sb.from("songs").insert({
    title: input.title,
    artist: input.artist || "",
    cover: input.cover || null,
    platform: input.platform || "spotify",
    link: input.link,
    year: input.year ? Number(input.year) : new Date().getFullYear(),
    featured: false,
    sort_order: 0,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateSong(id: string, input: SongInput): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  if (!input.title.trim() || !input.link.trim()) {
    return { ok: false, error: "Title and streaming link are required." };
  }
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const { error } = await sb
    .from("songs")
    .update({
      title: input.title,
      artist: input.artist || "",
      cover: input.cover || null,
      platform: input.platform || "spotify",
      link: input.link,
      year: input.year ? Number(input.year) : new Date().getFullYear(),
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteSong(id: string): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb.from("songs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setSongFeatured(id: string, featured: boolean): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb.from("songs").update({ featured }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Persists a new display order by writing each song's index as its sort_order. */
export async function reorderSongs(orderedIds: string[]): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const results = await Promise.all(
    orderedIds.map((id, i) => sb.from("songs").update({ sort_order: i }).eq("id", id))
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

// ── Request & booking status ─────────────────────────────────────────────────

export async function updateRequestStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb.from("custom_requests").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateBookingStatus(
  id: string,
  status: string
): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb.from("bookings").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateBooking(
  id: string,
  patch: { date?: string; time?: string }
): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb
    .from("bookings")
    .update({ date: patch.date ?? null, time: patch.time ?? null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export interface BookingInput {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  notes: string;
}

export async function submitBooking(
  input: BookingInput,
  guard?: AntiSpam
): Promise<ActionResult> {
  if (looksLikeBot(guard)) return { ok: true };
  if (!input.name.trim() || !input.email.trim()) {
    return { ok: false, error: "Name and email are required." };
  }

  const sb = getSupabaseServer();
  if (!sb) {
    return { ok: true, demo: true };
  }

  const { error } = await sb.from("bookings").insert({
    name: input.name,
    email: input.email,
    phone: input.phone || null,
    service: input.service,
    date: input.date || null,
    notes: input.notes || null,
    status: "Pending",
  });

  if (error) return { ok: false, error: error.message };
  await Promise.all([
    notifyProducer(
      `New booking — ${input.name}`,
      bookingEmail({ name: input.name, email: input.email, service: input.service, date: input.date })
    ),
    notifyCustomer(
      input.email,
      "Your booking request is in — Ibiga Beatz",
      customerBookingEmail({ name: input.name, service: input.service, date: input.date })
    ),
  ]);
  return { ok: true };
}

// ── Orders & digital delivery ────────────────────────────────────────────────

/** How long a delivered download link stays valid (7 days). */
const DOWNLOAD_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface OrderInput {
  beatId: string;
  beatTitle: string;
  amount: number;
  name: string;
  email: string;
  phone: string;
  note: string;
}

/** Public: a buyer reserves/purchases a beat. Producer fulfils it from the dashboard. */
export async function submitOrder(
  input: OrderInput,
  guard?: AntiSpam
): Promise<ActionResult> {
  if (looksLikeBot(guard)) return { ok: true };
  if (!input.email.trim() || !input.email.includes("@")) {
    return { ok: false, error: "A valid email is required." };
  }

  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const { error } = await sb.from("orders").insert({
    beat_id: input.beatId || null,
    beat_title: input.beatTitle || null,
    amount: input.amount || 0,
    customer_name: input.name || null,
    customer_email: input.email,
    customer_phone: input.phone || null,
    note: input.note || null,
    status: "Pending",
  });
  if (error) {
    // Orders table not created yet (migration 0005) — fail soft with a clear message.
    if (/relation|does not exist|schema cache/i.test(error.message)) {
      return { ok: false, error: "Ordering isn't available just yet — please contact the producer to buy this beat." };
    }
    return { ok: false, error: error.message };
  }

  await Promise.all([
    notifyProducer(
      `New order — ${input.beatTitle}`,
      orderEmail({ beatTitle: input.beatTitle, amount: input.amount, name: input.name, email: input.email, phone: input.phone, note: input.note })
    ),
    notifyCustomer(
      input.email,
      `We received your order — ${input.beatTitle}`,
      customerOrderEmail({ name: input.name, beatTitle: input.beatTitle, amount: input.amount })
    ),
  ]);
  return { ok: true };
}

/**
 * Producer action: fulfil an order. Mints a 7-day signed download link for the
 * beat's deliverable (if uploaded), emails it to the buyer, marks the order
 * Fulfilled and — exclusive model — marks the beat sold.
 */
export async function fulfilOrder(id: string): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const { data: order, error: e1 } = await sb.from("orders").select("*").eq("id", id).maybeSingle();
  if (e1 || !order) return { ok: false, error: e1?.message ?? "Order not found." };

  let downloadUrl: string | null = null;
  if (order.beat_id) {
    const { data: beat } = await sb.from("beats").select("deliverable_path").eq("id", order.beat_id).maybeSingle();
    const path = beat?.deliverable_path as string | undefined;
    if (path) {
      const { data: signed } = await sb.storage.from(DELIVERABLES_BUCKET).createSignedUrl(path, DOWNLOAD_TTL_SECONDS);
      downloadUrl = signed?.signedUrl ?? null;
    }
    // Exclusive rule: once sold, take it off the store.
    await sb.from("beats").update({ sold: true }).eq("id", order.beat_id);
  }

  const { error: e2 } = await sb
    .from("orders")
    .update({ status: "Fulfilled", fulfilled_at: new Date().toISOString() })
    .eq("id", id);
  if (e2) return { ok: false, error: e2.message };

  await notifyCustomer(
    order.customer_email,
    `Your beat is ready — ${order.beat_title ?? "Ibiga Beatz"}`,
    orderFulfilledEmail({ name: order.customer_name ?? "", beatTitle: order.beat_title ?? "", downloadUrl })
  );

  revalidatePath("/", "layout");
  // Surface a soft warning if there was nothing to deliver.
  return downloadUrl || !order.beat_id
    ? { ok: true }
    : { ok: true, error: "Fulfilled, but this beat has no deliverable file — upload one, then re-fulfil to send the download link." };
}

export async function cancelOrder(id: string): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb.from("orders").update({ status: "Cancelled" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

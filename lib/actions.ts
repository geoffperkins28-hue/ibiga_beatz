"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "./supabase/server";
import { getCurrentUser } from "./auth";
import { notifyProducer, requestEmail, bookingEmail } from "./notify";
import type { ProducerProfile } from "./types";

const MEDIA_BUCKET = "media";

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

/** Returns true if a public submission looks like a bot (silently drop it). */
function looksLikeBot(guard?: AntiSpam): boolean {
  if (!guard) return false;
  if (guard.hp && guard.hp.trim() !== "") return true;
  if (typeof guard.elapsedMs === "number" && guard.elapsedMs < 3000) return true;
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
  await notifyProducer(
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
  );
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
export async function createVoiceUpload(
  filename: string
): Promise<SignedUploadResult> {
  const sb = getSupabaseServer();
  if (!sb) return { error: "Storage isn't configured yet." };

  const ext = (filename.split(".").pop() || "webm").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const path = `requests/voice/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { data, error } = await sb.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { error: error?.message ?? "Could not start upload." };

  const { data: pub } = sb.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { path: data.path, token: data.token, publicUrl: pub.publicUrl };
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
}

export async function createBeat(input: BeatInput): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const { error } = await sb.from("beats").insert({
    title: input.title,
    genre: input.genre || "Afrobeats",
    bpm: input.bpm ? Number(input.bpm) : 0,
    mood: input.mood || null,
    price: input.price ? Number(input.price) : 0,
    duration: input.duration || null,
    image: input.image || null,
    audio_url: input.audioUrl || null,
    plays: 0,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateBeat(id: string, input: BeatInput): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  if (!input.title.trim()) return { ok: false, error: "Title is required." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };

  const { error } = await sb
    .from("beats")
    .update({
      title: input.title,
      genre: input.genre || "Afrobeats",
      bpm: input.bpm ? Number(input.bpm) : 0,
      mood: input.mood || null,
      price: input.price ? Number(input.price) : 0,
      duration: input.duration || null,
      image: input.image || null,
      audio_url: input.audioUrl || null,
    })
    .eq("id", id);
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
  await notifyProducer(
    `New booking — ${input.name}`,
    bookingEmail({ name: input.name, email: input.email, service: input.service, date: input.date })
  );
  return { ok: true };
}

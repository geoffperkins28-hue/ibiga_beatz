"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "./supabase/server";
import { getCurrentUser } from "./auth";
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
}

export async function submitCustomRequest(
  input: CustomRequestInput
): Promise<ActionResult> {
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
    status: "New",
  });

  if (error) return { ok: false, error: error.message };
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

export interface UploadResult {
  url?: string;
  error?: string;
}

/** Uploads an image to the public `media` bucket and returns its public URL. */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  if (!(await isAuthed())) return { error: "Not authorized." };
  const file = formData.get("file");
  const folder = (formData.get("folder") as string) || "misc";
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No file selected." };
  }

  const sb = getSupabaseServer();
  if (!sb) return { error: "Storage isn't configured yet." };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(path, buffer, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) return { error: error.message };

  const { data } = sb.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
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

export async function deleteSong(id: string): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Not authorized." };
  const sb = getSupabaseServer();
  if (!sb) return { ok: true, demo: true };
  const { error } = await sb.from("songs").delete().eq("id", id);
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
  input: BookingInput
): Promise<ActionResult> {
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
  return { ok: true };
}

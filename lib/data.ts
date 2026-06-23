import { getSupabaseServer } from "./supabase/server";
import {
  mockBeats,
  mockSongs,
  mockDashStats,
  mockClients,
  mockRequests,
  mockBookings,
  defaultProfile,
} from "./mock";
import type {
  Beat,
  Song,
  DashStat,
  Client,
  CustomRequest,
  Booking,
  ProducerProfile,
} from "./types";

// ── Row → domain mappers ─────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function rowToBeat(r: any): Beat {
  return {
    id: String(r.id),
    title: r.title,
    genre: r.genre,
    bpm: r.bpm,
    mood: r.mood,
    price: Number(r.price),
    duration: r.duration ?? "",
    plays: r.plays ?? 0,
    image: r.image ?? "",
    audioUrl: r.audio_url ?? null,
    sold: r.sold ?? false,
  };
}

function rowToSong(r: any): Song {
  return {
    id: String(r.id),
    title: r.title,
    artist: r.artist,
    cover: r.cover ?? "",
    platform: r.platform,
    link: r.link ?? "#",
    year: r.year ?? new Date().getFullYear(),
  };
}

function rowToRequest(r: any): CustomRequest {
  return {
    id: String(r.id),
    name: r.name,
    genre: r.genre ?? "",
    bpm: r.bpm ?? 0,
    budget: r.budget ?? "",
    status: r.status ?? "New",
    date: formatDate(r.created_at),
  };
}

function rowToBooking(r: any): Booking {
  return {
    id: String(r.id),
    name: r.name,
    service: r.service ?? "",
    date: r.date ?? "",
    time: r.time ?? "",
    status: r.status ?? "Pending",
  };
}

function rowToClient(r: any): Client {
  return {
    id: String(r.id),
    name: r.name,
    email: r.email ?? "",
    amount: r.amount ?? "₦0",
    orders: r.orders ?? 0,
    date: r.last_seen ?? formatDate(r.created_at),
  };
}

function formatDate(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function rowToProfile(r: any): ProducerProfile {
  return {
    displayName: r.display_name ?? defaultProfile.displayName,
    fullName: r.full_name ?? defaultProfile.fullName,
    role: r.role ?? defaultProfile.role,
    tagline: r.tagline ?? defaultProfile.tagline,
    bio: r.bio || defaultProfile.bio,
    avatarUrl: r.avatar_url || defaultProfile.avatarUrl,
    heroImageUrl: r.hero_image_url || defaultProfile.heroImageUrl,
  };
}

// ── Getters (Supabase with mock fallback) ────────────────────────────────────

export async function getProfile(): Promise<ProducerProfile> {
  const sb = getSupabaseServer();
  if (!sb) return defaultProfile;
  const { data, error } = await sb
    .from("producer_profile")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error || !data) return defaultProfile;
  return rowToProfile(data);
}

export async function getBeats(): Promise<Beat[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockBeats;
  const { data, error } = await sb
    .from("beats")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return mockBeats;
  return data.map(rowToBeat);
}

export async function getSongs(): Promise<Song[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockSongs;
  const { data, error } = await sb
    .from("songs")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return mockSongs;
  return data.map(rowToSong);
}

export async function getDashStats(): Promise<DashStat[]> {
  // Real aggregation comes later (needs orders/payments). Mock for now.
  return mockDashStats;
}

export async function getClients(): Promise<Client[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockClients;
  const { data, error } = await sb
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return mockClients;
  return data.map(rowToClient);
}

export async function getRequests(): Promise<CustomRequest[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockRequests;
  const { data, error } = await sb
    .from("custom_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return mockRequests;
  return data.map(rowToRequest);
}

export async function getBookings(): Promise<Booking[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockBookings;
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return mockBookings;
  return data.map(rowToBooking);
}

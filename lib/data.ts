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
  Order,
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
    key: r.key ?? "",
    notes: r.notes ?? "",
    deliverablePath: r.deliverable_path ?? "",
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
    featured: r.featured ?? false,
  };
}

function rowToRequest(r: any): CustomRequest {
  return {
    id: String(r.id),
    name: r.name,
    email: r.email ?? "",
    phone: r.phone ?? "",
    genre: r.genre ?? "",
    bpm: r.bpm ?? 0,
    mood: r.mood ?? "",
    refArtist: r.ref_artist ?? "",
    deadline: r.deadline ?? "",
    budget: r.budget ?? "",
    notes: r.notes ?? "",
    voiceUrl: r.voice_url ?? null,
    status: r.status ?? "New",
    date: formatDate(r.created_at),
  };
}

function rowToBooking(r: any): Booking {
  return {
    id: String(r.id),
    name: r.name,
    email: r.email ?? "",
    phone: r.phone ?? "",
    service: r.service ?? "",
    date: r.date ?? "",
    time: r.time ?? "",
    notes: r.notes ?? "",
    status: r.status ?? "Pending",
  };
}

function rowToOrder(r: any): Order {
  return {
    id: String(r.id),
    beatId: r.beat_id ? String(r.beat_id) : "",
    beatTitle: r.beat_title ?? "",
    amount: Number(r.amount ?? 0),
    name: r.customer_name ?? "",
    email: r.customer_email ?? "",
    phone: r.customer_phone ?? "",
    note: r.note ?? "",
    status: r.status ?? "Pending",
    date: formatDate(r.created_at),
    hasDeliverable: Boolean(r.beats?.deliverable_path),
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

// Public catalogue (beats/songs/profile) falls back to mock data only when
// Supabase isn't configured, or on a transient read error — so the storefront
// never looks broken. A genuinely empty table now returns [] (it used to
// wrongly resurface the mock seed once the producer cleared the catalogue).
export async function getBeats(): Promise<Beat[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockBeats;
  const { data, error } = await sb
    .from("beats")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return mockBeats;
  return data.map(rowToBeat);
}

/** A single beat by id — for the beat detail page. Falls back to mock in dev. */
export async function getBeatById(id: string): Promise<Beat | null> {
  const sb = getSupabaseServer();
  if (!sb) return mockBeats.find((b) => b.id === id) ?? null;
  const { data, error } = await sb.from("beats").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return rowToBeat(data);
}

/** Up to `limit` other beats in the same genre (for "related beats"). */
export async function getRelatedBeats(beat: Beat, limit = 4): Promise<Beat[]> {
  const all = await getBeats();
  const sameGenre = all.filter((b) => b.id !== beat.id && b.genre === beat.genre);
  const pool = sameGenre.length ? sameGenre : all.filter((b) => b.id !== beat.id);
  return pool.slice(0, limit);
}

export async function getSongs(): Promise<Song[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockSongs;
  const { data, error } = await sb
    .from("songs")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return mockSongs;
  return data.map(rowToSong);
}

// Real aggregation from the tables we have. Revenue/orders stats arrive with
// payments; until then we surface honest counts instead of invented figures.
export async function getDashStats(): Promise<DashStat[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockDashStats;

  const [beats, songs, requests, bookings] = await Promise.all([
    sb.from("beats").select("*", { count: "exact", head: true }),
    sb.from("songs").select("*", { count: "exact", head: true }),
    sb.from("custom_requests").select("status"),
    sb.from("bookings").select("status"),
  ]);

  const reqRows = (requests.data as { status?: string }[] | null) ?? [];
  const bkRows = (bookings.data as { status?: string }[] | null) ?? [];
  const newReq = reqRows.filter((r) => r.status === "New").length;
  const pendingBk = bkRows.filter((b) => b.status === "Pending").length;

  return [
    { label: "Beats in Store", value: String(beats.count ?? 0), icon: "ShoppingBag", change: "" },
    { label: "Productions", value: String(songs.count ?? 0), icon: "Music", change: "" },
    { label: "Custom Requests", value: String(reqRows.length), icon: "Mic", change: newReq ? `${newReq} new` : "" },
    { label: "Bookings", value: String(bkRows.length), icon: "Calendar", change: pendingBk ? `${pendingBk} pending` : "" },
  ];
}

// Admin-only reads return real rows (empty when there are none). They fall back
// to mock only when Supabase isn't configured — never on empty — so the
// dashboard never shows fabricated clients/requests/bookings in production.
export async function getClients(): Promise<Client[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockClients;
  const { data, error } = await sb
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToClient);
}

export async function getRequests(): Promise<CustomRequest[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockRequests;
  const { data, error } = await sb
    .from("custom_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToRequest);
}

export async function getOrders(): Promise<Order[]> {
  const sb = getSupabaseServer();
  if (!sb) return [];
  // Join the beat so we know whether a deliverable file still exists to hand over.
  const { data, error } = await sb
    .from("orders")
    .select("*, beats(deliverable_path)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToOrder);
}

export async function getBookings(): Promise<Booking[]> {
  const sb = getSupabaseServer();
  if (!sb) return mockBookings;
  const { data, error } = await sb
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(rowToBooking);
}

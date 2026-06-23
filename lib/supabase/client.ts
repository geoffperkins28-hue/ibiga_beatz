"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client (anon key). Returns `null` if env vars are missing.
 * Use for client-side reads/realtime; mutations go through server actions.
 */
let browserClient: SupabaseClient | null | undefined;

export function getSupabaseBrowser(): SupabaseClient | null {
  if (browserClient !== undefined) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  browserClient = url && key ? createClient(url, key) : null;
  return browserClient;
}

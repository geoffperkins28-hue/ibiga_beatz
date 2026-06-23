import { getSupabaseRSC } from "./supabase/rsc";

/** Returns the currently logged-in user, or null. */
export async function getCurrentUser() {
  const sb = await getSupabaseRSC();
  if (!sb) return null;
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}

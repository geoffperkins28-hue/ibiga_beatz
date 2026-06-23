import { redirect } from "next/navigation";
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

/**
 * Server-side guard for admin pages. Redirects to the login page when not
 * authenticated — defense-in-depth that doesn't rely on middleware alone.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

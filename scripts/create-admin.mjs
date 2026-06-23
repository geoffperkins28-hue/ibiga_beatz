// Creates (or updates) the producer's admin login in Supabase Auth.
//
// Usage (from the project root, with .env present):
//   ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="your-strong-password" node scripts/create-admin.mjs
//
// Uses the service-role key from .env. The user can log in at /admin/login.

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD, e.g.\n  ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="secret" node scripts/create-admin.mjs');
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: list } = await sb.auth.admin.listUsers();
const existing = list?.users.find((u) => u.email === email);

if (existing) {
  const { error } = await sb.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  console.log(error ? "Update failed: " + error.message : `Updated password for ${email}.`);
} else {
  const { error } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  console.log(error ? "Create failed: " + error.message : `Admin created: ${email}. Log in at /admin/login.`);
}

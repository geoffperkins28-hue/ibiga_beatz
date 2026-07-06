// One-off: rescales seeded beat prices from USD-scale to Naira (×1000).
// Idempotent — only touches rows still priced < 1000 (i.e. the old USD seed),
// so re-running it after prices are already in Naira is a no-op.
//
// Usage (from project root, with .env present):
//   node scripts/rescale-prices.mjs

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

const sb = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: beats, error } = await sb.from("beats").select("id, title, price");
if (error) {
  console.error("Read failed:", error.message);
  process.exit(1);
}

const toFix = (beats ?? []).filter((b) => Number(b.price) > 0 && Number(b.price) < 1000);
if (toFix.length === 0) {
  console.log(`No beats to rescale (all ${beats?.length ?? 0} already look like Naira).`);
  process.exit(0);
}

for (const b of toFix) {
  const next = Math.round(Number(b.price) * 1000);
  const { error: upErr } = await sb.from("beats").update({ price: next }).eq("id", b.id);
  console.log(upErr ? `  ✗ ${b.title}: ${upErr.message}` : `  ✓ ${b.title}: ₦${Number(b.price).toLocaleString()} → ₦${next.toLocaleString()}`);
}
console.log(`Done — rescaled ${toFix.length} beat(s).`);

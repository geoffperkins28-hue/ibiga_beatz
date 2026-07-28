// Creates the PRIVATE "deliverables" storage bucket for purchased beat files
// (full MP3/WAV/stems). Buyers only ever get short-lived signed URLs to these —
// they are never publicly listable, unlike the "media" bucket.
//
// Usage (from project root, with .env present):
//   node scripts/create-deliverables-bucket.mjs

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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data: existing } = await sb.storage.getBucket("deliverables");
if (existing) {
  console.log("Bucket 'deliverables' already exists (private:", !existing.public, ").");
  process.exit(0);
}

const { error } = await sb.storage.createBucket("deliverables", {
  public: false,
  fileSizeLimit: 52428800, // 50 MB (raise later if selling large WAV/stem packs)
});

console.log(error ? "Create failed: " + error.message : "Created PRIVATE bucket 'deliverables'.");

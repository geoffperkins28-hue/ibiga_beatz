-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0003 — "media" Storage bucket + public read / authenticated write
-- Run this in the Supabase SQL editor after migration 0002.
-- ─────────────────────────────────────────────────────────────────────────────

-- Public bucket. The site serves beat covers, preview audio and song artwork to
-- anonymous visitors, so the bucket itself is public for reads.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- ── Storage policies ─────────────────────────────────────────────────────────
-- Same philosophy as the table RLS: the public can read, only the authenticated
-- producer can write. The signed-upload flow (lib/upload-client.ts) carries the
-- producer's session, so these policies match on upload.

-- Anyone can view objects (covers, audio previews, song artwork).
create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');

-- Only the authenticated producer can upload.
create policy "media auth upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

-- Only the authenticated producer can replace a file.
create policy "media auth update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');

-- Only the authenticated producer can delete.
create policy "media auth delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

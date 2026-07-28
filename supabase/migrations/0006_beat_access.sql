-- ─────────────────────────────────────────────────────────────────────────────
-- Ibiga Beatz — free vs paid beats
-- Run in the Supabase SQL editor. Safe to run more than once.
--   is_free = true  → musicians download the (tagged) preview MP3 directly
--   is_free = false → paid/exclusive: order flow + producer delivers the file
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.beats add column if not exists is_free boolean not null default false;

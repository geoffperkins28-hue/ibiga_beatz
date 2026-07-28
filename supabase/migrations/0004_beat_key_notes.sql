-- ─────────────────────────────────────────────────────────────────────────────
-- Ibiga Beatz — add musical Key + Producer notes to beats (Phase A: beat page)
-- Run this in the Supabase SQL editor before deploying the beat-detail page.
-- Safe to run more than once.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.beats add column if not exists key   text;
alter table public.beats add column if not exists notes text;

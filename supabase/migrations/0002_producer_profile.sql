-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 0002 — producer_profile (editable hero/avatar/bio) + media bucket
-- Run this in the Supabase SQL editor after the initial schema.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- Single-row table holding the producer's public profile / branding.
create table if not exists public.producer_profile (
  id             text primary key default 'default',
  display_name   text not null default 'Ibiga Beatz',
  full_name      text not null default 'Ibiga Okonkwo',
  role           text not null default 'Music Producer · Sound Engineer',
  tagline        text default 'Crafting hits across Afrobeats, Amapiano & R&B since 2016. Lagos-born, globally heard.',
  bio            text,
  avatar_url     text,
  hero_image_url text,
  updated_at     timestamptz not null default now(),
  constraint single_row check (id = 'default')
);

insert into public.producer_profile (id) values ('default')
on conflict (id) do nothing;

alter table public.producer_profile enable row level security;

create policy "public read profile"
  on public.producer_profile for select using (true);

create policy "auth manage profile"
  on public.producer_profile for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage: a public "media" bucket is created from the app via the service-role
-- key (see scripts) — no SQL needed. Once auth is added, lock its policies to
-- the producer.

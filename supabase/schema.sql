-- ─────────────────────────────────────────────────────────────────────────────
-- Ibiga Beatz — Supabase schema
-- Run this in the Supabase SQL editor (or `supabase db push`) after creating
-- your project. The app falls back to mock data until these tables have rows.
-- ─────────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Beats (store catalogue) ──────────────────────────────────────────────────
create table if not exists public.beats (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  genre       text not null,
  bpm         integer not null default 0,
  mood        text,
  price       numeric not null default 0,
  duration    text,
  plays       integer not null default 0,
  image       text,           -- cover artwork URL (Supabase Storage public URL)
  audio_url   text,           -- preview audio URL
  sold        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Produced songs (showcase) ────────────────────────────────────────────────
create table if not exists public.songs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  artist      text not null,
  cover       text,
  platform    text not null default 'spotify',  -- spotify | youtube | apple
  link        text,
  year        integer,
  sort_order  integer not null default 0,
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Custom beat requests ─────────────────────────────────────────────────────
create table if not exists public.custom_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  genre       text,
  bpm         integer,
  mood        text,
  ref_artist  text,
  deadline    text,
  budget      text,
  notes       text,
  voice_url   text,           -- uploaded/recorded voice idea
  status      text not null default 'New',
  created_at  timestamptz not null default now()
);

-- ── Bookings ─────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  service     text not null,
  date        text,
  time        text,
  notes       text,
  status      text not null default 'Pending',
  created_at  timestamptz not null default now()
);

-- ── Clients (mini CRM) ───────────────────────────────────────────────────────
create table if not exists public.clients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  amount      text default '₦0',
  orders      integer not null default 0,
  notes       text,
  last_seen   text,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security
--   Public can READ the catalogue (beats, songs) and INSERT requests/bookings.
--   Reading requests/bookings/clients and managing the catalogue is the
--   producer's job — lock those to authenticated users (add an admin check
--   once auth is set up).
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.beats            enable row level security;
alter table public.songs            enable row level security;
alter table public.custom_requests  enable row level security;
alter table public.bookings         enable row level security;
alter table public.clients          enable row level security;

-- Public catalogue reads
create policy "public read beats"  on public.beats  for select using (true);
create policy "public read songs"  on public.songs  for select using (true);

-- Public can submit requests/bookings
create policy "public insert requests" on public.custom_requests for insert with check (true);
create policy "public insert bookings" on public.bookings        for insert with check (true);

-- Authenticated (producer) full access. Tighten to an admin uid/role later.
create policy "auth manage beats"     on public.beats           for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth manage songs"     on public.songs           for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth read requests"    on public.custom_requests for select using (auth.role() = 'authenticated');
create policy "auth manage requests"  on public.custom_requests for update using (auth.role() = 'authenticated');
create policy "auth read bookings"    on public.bookings        for select using (auth.role() = 'authenticated');
create policy "auth manage bookings"  on public.bookings        for update using (auth.role() = 'authenticated');
create policy "auth manage clients"   on public.clients         for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- NOTE: The server uses the service-role key, which bypasses RLS — so form
-- submissions and dashboard reads work server-side regardless of the policies
-- above. The policies matter once you add client-side / anon-key access.

-- ── Producer profile (editable hero/avatar/bio — see migration 0002) ──────────
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
insert into public.producer_profile (id) values ('default') on conflict (id) do nothing;
alter table public.producer_profile enable row level security;
create policy "public read profile"  on public.producer_profile for select using (true);
create policy "auth manage profile"  on public.producer_profile for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

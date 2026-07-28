-- ─────────────────────────────────────────────────────────────────────────────
-- Ibiga Beatz — Orders + digital delivery (Phase B)
-- Run this in the Supabase SQL editor. Safe to run more than once.
-- Also create a PRIVATE storage bucket named "deliverables"
-- (scripts/create-deliverables-bucket.mjs does this for you).
-- ─────────────────────────────────────────────────────────────────────────────

-- Where the clean/full purchasable file lives (path inside the private bucket).
alter table public.beats add column if not exists deliverable_path text;

-- Orders: a buyer reserves/purchases a beat. Exclusive model = one buyer per beat.
create table if not exists public.orders (
  id             uuid primary key default gen_random_uuid(),
  beat_id        uuid references public.beats(id) on delete set null,
  beat_title     text,                     -- snapshot so it survives beat deletion
  amount         numeric not null default 0,
  customer_name  text,
  customer_email text not null,
  customer_phone text,
  note           text,
  status         text not null default 'Pending',  -- Pending | Fulfilled | Cancelled
  created_at     timestamptz not null default now(),
  fulfilled_at   timestamptz
);

alter table public.orders enable row level security;

-- Public can place an order; only the authenticated producer reads/updates them.
-- (The server uses the service-role key, which bypasses RLS regardless.)
create policy "public insert orders" on public.orders for insert with check (true);
create policy "auth read orders"     on public.orders for select using (auth.role() = 'authenticated');
create policy "auth manage orders"   on public.orders for update using (auth.role() = 'authenticated');

# Ibiga Beatz

A platform for music producer **Ibiga Beatz** — public website (beat store, portfolio,
produced songs, custom beat requests, bookings) plus a producer dashboard.

Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Supabase**.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

The app runs on **mock data out of the box** — no backend required to develop the UI.
It automatically switches to live data once Supabase is configured.

## Wiring up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) to create the tables
   (`beats`, `songs`, `custom_requests`, `bookings`, `clients`) and RLS policies.
3. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — used for form inserts & dashboard reads)
4. Restart `npm run dev`.

Empty tables still fall back to mock data, so the UI never looks broken. Add a row to
`beats`/`songs` and it appears immediately.

### Email notifications (optional)
To email the producer on each new custom request / booking, create a free
[Resend](https://resend.com) account, verify a sender, and set `RESEND_API_KEY`,
`RESEND_FROM`, and `PRODUCER_NOTIFY_EMAIL` (see `.env.example`). Left blank, notifications
are skipped — the in-dashboard unread badges work regardless. Optionally set
`NEXT_PUBLIC_SITE_URL` to your deployed URL for correct link-preview/OG image URLs.

## Routes

| Route        | Page                                   |
|--------------|----------------------------------------|
| `/`          | Home (hero, featured beats, latest)    |
| `/store`     | Beat Store (search, filter, preview)   |
| `/portfolio` | Producer bio, achievements, services   |
| `/songs`     | Produced songs showcase                |
| `/request`   | Custom beat request form               |
| `/booking`   | Session booking form                   |
| `/admin`     | Producer dashboard (Supabase Auth)     |
| `/admin/login` | Producer login                       |

## Project structure

```
app/                 routes (server components fetch data, pass to views)
components/
  shell/AppShell     sidebar + topbar + layout chrome
  views/             one component per page (mostly client components)
  MiniPlayer, BeatCard, SongCard, Field
lib/
  data.ts            data getters — Supabase with mock fallback
  actions.ts         server actions for form submissions
  supabase/          server + browser clients
  mock.ts, types.ts, constants.ts
supabase/schema.sql  database schema + RLS
```

## Not yet built (next milestones)

- **Auth** — gate `/dashboard` behind Supabase Auth (single producer login).
- **Payments** — Paystack / Flutterwave checkout + order history.
- **Storage uploads** — beat audio, cover art, voice-idea recording.
- **Notifications** — email on new purchase / booking / request.
- **Dashboard CRUD** — wire the upload/edit/delete buttons to Supabase.

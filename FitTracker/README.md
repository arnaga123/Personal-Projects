# FitTracker

A gym-tracking app built around a 41-response survey: progress graphs, workout logging,
splits that fit your schedule, and a streak to keep you consistent.

Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres, Auth, Storage).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign up/log in, and create a new project (free tier is fine).
2. In the project dashboard, go to **Project Settings → API** and copy the **Project URL** and
   the **anon public** key.
3. Copy `.env.local.example` to `.env.local` and paste those two values in:

   ```bash
   cp .env.local.example .env.local
   ```

## 2. Run the database migrations

Run these in order in the Supabase dashboard's **SQL Editor** (paste the full file contents,
click Run, repeat for the next one):

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_more_exercises.sql`
3. `supabase/migrations/0003_exercise_details.sql`

`0001` creates all the tables (profiles, exercises, splits, workouts, body metrics), row-level
security policies scoping every user to their own data, a trigger that creates a `profiles`
row on signup, an initial seeded exercise library, and a public `progress-photos` storage
bucket for body-transformation photos. `0002` adds a unique constraint on exercise names and
expands the library to ~65 exercises. `0003` adds instructions, rest time, and secondary
muscle groups to every exercise, and opens up exercise creation to any signed-in user.

## 3. Run the app

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up for an account, then use the nav
to log a workout, build a split, or log a body-metric entry — the dashboard graphs and streak
fill in as you go. Tap any exercise in the Exercises tab for form cues, a body diagram of the
muscles it targets, and recommended rest time — or add your own via the form at the bottom of
that page.

## Project structure

- `app/(auth)` — login/signup, centered card layout
- `app/(app)` — the authenticated app shell (sidebar nav) and its pages: dashboard, log,
  splits, exercises, progress, settings
- `app/actions/` — Server Actions (mutations) for auth, workouts, splits, progress, profile
- `lib/data/` — server-only read queries used by pages
- `lib/supabase/` — browser client, server client, and the session-refresh logic used by
  `proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts` — see `AGENTS.md`)
- `supabase/migrations/` — schema, RLS policies, and seed data (run in order)
- `lib/split-templates.ts` — the built-in recommended splits (Full Body, Upper/Lower, PPL, Bro
  Split) shown on the Splits page, resolved against whatever's in the exercise library

## Notes

- Auth is Supabase email/password. Route protection happens both optimistically in `proxy.ts`
  (cookie check) and again in each page via `lib/dal.ts` (`verifySession`), per Next.js's
  recommended auth pattern.
- Design system: dark background, one accent color (lime), Space Grotesk for headings/stats,
  Inter for body text — see `app/globals.css`.

-- Tracks whether a user has completed the first-run onboarding questions
-- (goal, experience level, training days/week) so proxy.ts can gate access
-- to the rest of the app until they have.
-- Run this in the Supabase SQL editor after 0001-0006.

alter table public.profiles
  add column if not exists onboarding_completed_at timestamptz;

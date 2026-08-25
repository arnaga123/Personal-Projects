-- FitTracker schema, RLS policies, seed exercise library, and storage bucket.
-- Run this once in the Supabase SQL editor for a new project.

create extension if not exists "pgcrypto";

-- Profiles ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  goal text check (goal in ('bulk', 'cut', 'maintain')),
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  days_per_week_pref int check (days_per_week_pref between 1 and 7),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are insertable by owner" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Exercises (public read, shared library) ------------------------------

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text not null,
  equipment text,
  description text
);

alter table public.exercises enable row level security;
create policy "Exercises are readable by anyone" on public.exercises
  for select using (true);

-- Splits -----------------------------------------------------------------

create table if not exists public.splits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  days_per_week int not null check (days_per_week between 1 and 7),
  created_at timestamptz not null default now()
);

alter table public.splits enable row level security;
create policy "Splits are managed by owner" on public.splits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.split_days (
  id uuid primary key default gen_random_uuid(),
  split_id uuid not null references public.splits(id) on delete cascade,
  day_index int not null,
  name text not null
);

alter table public.split_days enable row level security;
create policy "Split days follow split owner" on public.split_days
  for all using (
    exists (select 1 from public.splits s where s.id = split_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.splits s where s.id = split_id and s.user_id = auth.uid())
  );

create table if not exists public.split_day_exercises (
  split_day_id uuid not null references public.split_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  order_index int not null,
  primary key (split_day_id, exercise_id)
);

alter table public.split_day_exercises enable row level security;
create policy "Split day exercises follow split owner" on public.split_day_exercises
  for all using (
    exists (
      select 1 from public.split_days sd
      join public.splits s on s.id = sd.split_id
      where sd.id = split_day_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.split_days sd
      join public.splits s on s.id = sd.split_id
      where sd.id = split_day_id and s.user_id = auth.uid()
    )
  );

-- Workouts -----------------------------------------------------------------

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  split_day_id uuid references public.split_days(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.workouts enable row level security;
create policy "Workouts are managed by owner" on public.workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  set_index int not null,
  reps int not null,
  weight numeric not null,
  unit text not null default 'lb' check (unit in ('lb', 'kg'))
);

alter table public.workout_sets enable row level security;
create policy "Workout sets follow workout owner" on public.workout_sets
  for all using (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.workouts w where w.id = workout_id and w.user_id = auth.uid())
  );

-- Body metrics ---------------------------------------------------------

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric,
  measurements jsonb not null default '{}',
  photo_url text,
  created_at timestamptz not null default now()
);

alter table public.body_metrics enable row level security;
create policy "Body metrics are managed by owner" on public.body_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed exercise library --------------------------------------------------

insert into public.exercises (name, muscle_group, equipment, description) values
  ('Barbell Back Squat', 'legs', 'Barbell', 'Primary quad and glute compound lift.'),
  ('Romanian Deadlift', 'legs', 'Barbell', 'Hamstring and glute hinge movement.'),
  ('Leg Press', 'legs', 'Machine', 'Quad-dominant machine push.'),
  ('Walking Lunge', 'legs', 'Dumbbells', 'Unilateral quad and glute work.'),
  ('Standing Calf Raise', 'legs', 'Machine', 'Calf isolation.'),
  ('Barbell Bench Press', 'chest', 'Barbell', 'Primary horizontal push for chest.'),
  ('Incline Dumbbell Press', 'chest', 'Dumbbells', 'Upper chest emphasis.'),
  ('Cable Chest Fly', 'chest', 'Cable', 'Chest isolation, constant tension.'),
  ('Push-Up', 'chest', 'Bodyweight', 'Bodyweight horizontal push.'),
  ('Pull-Up', 'back', 'Bodyweight', 'Vertical pull, lats and biceps.'),
  ('Barbell Row', 'back', 'Barbell', 'Horizontal pull for mid-back thickness.'),
  ('Lat Pulldown', 'back', 'Cable', 'Machine vertical pull.'),
  ('Seated Cable Row', 'back', 'Cable', 'Horizontal pull, mid-back.'),
  ('Deadlift', 'back', 'Barbell', 'Full posterior chain compound lift.'),
  ('Overhead Press', 'shoulders', 'Barbell', 'Primary vertical push for shoulders.'),
  ('Lateral Raise', 'shoulders', 'Dumbbells', 'Side delt isolation.'),
  ('Rear Delt Fly', 'shoulders', 'Dumbbells', 'Rear delt isolation.'),
  ('Barbell Curl', 'arms', 'Barbell', 'Biceps isolation.'),
  ('Hammer Curl', 'arms', 'Dumbbells', 'Biceps and forearm isolation.'),
  ('Tricep Pushdown', 'arms', 'Cable', 'Triceps isolation.'),
  ('Skull Crusher', 'arms', 'Barbell', 'Triceps isolation.'),
  ('Plank', 'core', 'Bodyweight', 'Anti-extension core hold.'),
  ('Hanging Leg Raise', 'core', 'Bodyweight', 'Lower ab and hip flexor work.'),
  ('Cable Crunch', 'core', 'Cable', 'Weighted ab flexion.')
on conflict do nothing;

-- Storage bucket for progress photos --------------------------------------

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;

create policy "Users can upload their own progress photos"
  on storage.objects for insert
  with check (bucket_id = 'progress-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Progress photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'progress-photos');

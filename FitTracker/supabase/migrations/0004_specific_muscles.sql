-- Adds an optional, more precise "specific muscle" layer on top of the existing broad
-- muscle_group column. The broad groups stay as-is (still used for the exercise list
-- filter and dashboard stats) — this only adds finer targeting for the body diagram,
-- populated for exercises where a specific muscle is well-established (isolation
-- movements). Compound lifts (squats, deadlifts, presses) are left unset and fall back
-- to the broad muscle_group/secondary_muscle_groups highlight, since a single "primary"
-- muscle would misrepresent a multi-joint movement.
-- Run this in the Supabase SQL editor after 0001-0003.

alter table public.exercises
  add column if not exists specific_muscle text,
  add column if not exists specific_secondary_muscles text[] not null default '{}';

alter table public.exercises
  add constraint exercises_specific_muscle_check
  check (specific_muscle is null or specific_muscle in (
    'anterior_deltoid', 'lateral_deltoid', 'posterior_deltoid',
    'upper_pectoralis', 'lower_pectoralis',
    'biceps_brachii', 'brachialis', 'brachioradialis', 'triceps_brachii',
    'trapezius', 'latissimus_dorsi',
    'rectus_abdominis', 'obliques',
    'quadriceps', 'hamstrings', 'gluteus_maximus', 'gastrocnemius'
  ));

alter table public.exercises
  add constraint exercises_specific_secondary_muscles_check
  check (specific_secondary_muscles <@ array[
    'anterior_deltoid', 'lateral_deltoid', 'posterior_deltoid',
    'upper_pectoralis', 'lower_pectoralis',
    'biceps_brachii', 'brachialis', 'brachioradialis', 'triceps_brachii',
    'trapezius', 'latissimus_dorsi',
    'rectus_abdominis', 'obliques',
    'quadriceps', 'hamstrings', 'gluteus_maximus', 'gastrocnemius'
  ]::text[]);

update public.exercises as e set
  specific_muscle = v.muscle,
  specific_secondary_muscles = v.secondary
from (values
  ('Barbell Curl', 'biceps_brachii', array['brachialis']::text[]),
  ('Hammer Curl', 'brachialis', array['brachioradialis', 'biceps_brachii']::text[]),
  ('Preacher Curl', 'biceps_brachii', array['brachialis']::text[]),
  ('Concentration Curl', 'biceps_brachii', '{}'::text[]),
  ('Cable Curl', 'biceps_brachii', array['brachialis']::text[]),

  ('Tricep Pushdown', 'triceps_brachii', '{}'::text[]),
  ('Skull Crusher', 'triceps_brachii', '{}'::text[]),
  ('Overhead Tricep Extension', 'triceps_brachii', '{}'::text[]),
  ('Dumbbell Kickback', 'triceps_brachii', '{}'::text[]),
  ('Close-Grip Bench Press', 'triceps_brachii', array['lower_pectoralis']::text[]),

  ('Lateral Raise', 'lateral_deltoid', '{}'::text[]),
  ('Cable Lateral Raise', 'lateral_deltoid', '{}'::text[]),
  ('Front Raise', 'anterior_deltoid', '{}'::text[]),
  ('Rear Delt Fly', 'posterior_deltoid', '{}'::text[]),
  ('Face Pull', 'posterior_deltoid', array['trapezius']::text[]),
  ('Arnold Press', 'anterior_deltoid', array['lateral_deltoid']::text[]),
  ('Dumbbell Shoulder Press', 'anterior_deltoid', array['lateral_deltoid']::text[]),
  ('Overhead Press', 'anterior_deltoid', array['lateral_deltoid']::text[]),
  ('Landmine Press', 'anterior_deltoid', '{}'::text[]),
  ('Upright Row', 'lateral_deltoid', array['trapezius']::text[]),
  ('Shrug', 'trapezius', '{}'::text[]),

  ('Incline Barbell Press', 'upper_pectoralis', array['anterior_deltoid']::text[]),
  ('Incline Dumbbell Press', 'upper_pectoralis', array['anterior_deltoid']::text[]),
  ('Decline Barbell Press', 'lower_pectoralis', array['triceps_brachii']::text[]),
  ('Flat Dumbbell Press', 'lower_pectoralis', array['triceps_brachii']::text[]),
  ('Barbell Bench Press', 'lower_pectoralis', array['triceps_brachii']::text[]),
  ('Dumbbell Fly', 'lower_pectoralis', '{}'::text[]),
  ('Cable Chest Fly', 'lower_pectoralis', '{}'::text[]),
  ('Pec Deck', 'lower_pectoralis', '{}'::text[]),
  ('Dips', 'lower_pectoralis', array['triceps_brachii']::text[]),
  ('Push-Up', 'lower_pectoralis', array['triceps_brachii', 'anterior_deltoid']::text[]),

  ('Pull-Up', 'latissimus_dorsi', array['biceps_brachii']::text[]),
  ('Chin-Up', 'latissimus_dorsi', array['biceps_brachii']::text[]),
  ('Lat Pulldown', 'latissimus_dorsi', array['biceps_brachii']::text[]),
  ('Straight-Arm Pulldown', 'latissimus_dorsi', '{}'::text[]),
  ('Barbell Row', 'latissimus_dorsi', array['trapezius']::text[]),
  ('T-Bar Row', 'latissimus_dorsi', array['trapezius']::text[]),
  ('Seated Cable Row', 'latissimus_dorsi', array['trapezius']::text[]),
  ('Single-Arm Dumbbell Row', 'latissimus_dorsi', array['trapezius']::text[]),
  ('Chest-Supported Row', 'latissimus_dorsi', array['trapezius']::text[]),

  ('Leg Extension', 'quadriceps', '{}'::text[]),
  ('Lying Leg Curl', 'hamstrings', '{}'::text[]),
  ('Standing Calf Raise', 'gastrocnemius', '{}'::text[]),
  ('Seated Calf Raise', 'gastrocnemius', '{}'::text[]),
  ('Hip Thrust', 'gluteus_maximus', array['hamstrings']::text[]),
  ('Glute Bridge', 'gluteus_maximus', array['hamstrings']::text[]),

  ('Cable Crunch', 'rectus_abdominis', '{}'::text[]),
  ('Sit-Up', 'rectus_abdominis', '{}'::text[]),
  ('Hanging Leg Raise', 'rectus_abdominis', '{}'::text[]),
  ('Toes to Bar', 'rectus_abdominis', array['latissimus_dorsi']::text[]),
  ('Ab Wheel Rollout', 'rectus_abdominis', array['obliques']::text[]),
  ('Plank', 'rectus_abdominis', array['obliques']::text[]),
  ('Mountain Climber', 'rectus_abdominis', '{}'::text[]),
  ('Russian Twist', 'obliques', '{}'::text[]),
  ('Side Plank', 'obliques', '{}'::text[])
) as v(name, muscle, secondary)
where e.name = v.name;

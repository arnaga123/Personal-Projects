-- Expands the exercise library with movements not yet covered (sumo deadlift,
-- adduction/hip-flexor work, rotator-cuff and anti-rotation core patterns, etc.),
-- fully populated on insert since 0003-0005 already added every detail column.
-- Run this in the Supabase SQL editor after 0001-0005.

insert into public.exercises
  (name, muscle_group, equipment, description, instructions, rest_seconds, secondary_muscle_groups, specific_muscle, specific_secondary_muscles, why_effective)
values
  ('Sumo Deadlift', 'legs', 'Barbell',
   'Wide-stance deadlift variation that emphasizes the glutes and adductors.',
   'Set up with a wide stance and toes turned out, gripping the bar inside your knees. Keeping your chest up and back flat, drive through your heels to stand, then lower the bar back down under control.',
   150, array['back', 'core']::text[], 'gluteus_maximus', array['hamstrings']::text[],
   'The wide stance shifts the hip angle to bias the glutes and inner-thigh adductors while shortening the pull distance, letting you lift heavy with less lower-back strain than a conventional deadlift.'),

  ('Nordic Hamstring Curl', 'legs', 'Bodyweight',
   'Bodyweight hamstring exercise that trains the eccentric lowering phase.',
   'Kneel with your ankles anchored, and lower your torso toward the floor as slowly as possible by resisting with your hamstrings, catching yourself with your hands at the bottom, then use your hamstrings to pull back up.',
   90, '{}'::text[], 'hamstrings', '{}'::text[],
   'Lowering your bodyweight under control trains the hamstrings eccentrically at long muscle lengths, a stimulus shown to reduce strain injuries that curls and hip hinges don''t fully replicate.'),

  ('Hip Adduction Machine', 'legs', 'Machine',
   'Machine isolation for the inner thigh.',
   'Sit in the machine with the pads against your inner thighs, then squeeze your legs together against the resistance, and return under control.',
   60, '{}'::text[], null, '{}'::text[],
   'A fixed, supported path isolates the adductors through hip adduction alone, a movement pattern most lower-body compounds only train indirectly.'),

  ('Pendlay Row', 'back', 'Barbell',
   'Explosive barbell row performed from a dead stop on the floor.',
   'With a flat back parallel to the floor, pull the bar explosively from the floor to your lower ribs, then lower it back to a complete stop before the next rep.',
   120, array['arms']::text[], 'latissimus_dorsi', array['trapezius']::text[],
   'Resetting the bar to the floor on every rep removes stretch-reflex momentum, forcing the back to generate all the pulling force from a dead stop for stricter lat and upper-back development.'),

  ('Cable Pullover', 'back', 'Cable',
   'Cable isolation for the lats through shoulder extension.',
   'Standing with a slight forward lean, pull the cable bar down and back in an arc from overhead to your thighs, keeping your arms mostly straight, then return under control.',
   75, '{}'::text[], 'latissimus_dorsi', '{}'::text[],
   'Isolating shoulder extension with straight arms trains the lats through a long stretch-to-contraction arc without any biceps assistance, unlike rows and pulldowns.'),

  ('Inverted Row', 'back', 'Bodyweight',
   'Bodyweight horizontal pull using a bar or rings.',
   'Hang under a bar with your body straight, then pull your chest up to the bar by driving your elbows back, and lower under control.',
   90, array['arms']::text[], 'latissimus_dorsi', array['biceps_brachii']::text[],
   'A bodyweight horizontal pull that builds the same back and biceps strength as a barbell row while being easy to scale by adjusting your body angle.'),

  ('Machine Chest Press', 'chest', 'Machine',
   'Fixed-path pressing movement for the chest.',
   'Sit with the handles at chest height, press forward to full extension, then return under control without locking out aggressively.',
   90, array['arms']::text[], 'lower_pectoralis', array['triceps_brachii']::text[],
   'The fixed, supported path removes stabilizer demand entirely, letting you push the chest and triceps to failure safely with no spotter needed.'),

  ('Svend Press', 'chest', 'Plate',
   'Isometric chest press holding a weight plate between the palms.',
   'Press two plates together in front of your chest with straight arms, then extend your arms forward while maintaining the squeeze, and return under control.',
   60, '{}'::text[], 'upper_pectoralis', '{}'::text[],
   'Squeezing the plates together creates constant isometric tension across the inner chest through the whole movement, a contraction style pressing exercises don''t produce.'),

  ('Incline Cable Fly', 'chest', 'Cable',
   'Cable fly performed on an incline bench for upper chest emphasis.',
   'On an incline bench with cables set low, bring the handles up and together in an arc above your chest, then return under control to a deep stretch.',
   75, '{}'::text[], 'upper_pectoralis', '{}'::text[],
   'The upward cable angle keeps tension on the upper chest through the entire arc, including the fully-stretched bottom position that an incline dumbbell fly loses tension in.'),

  ('Cable Front Raise', 'shoulders', 'Cable',
   'Cable isolation for the front deltoid.',
   'With the cable low behind you, raise the handle straight out in front to shoulder height, then lower under control.',
   60, '{}'::text[], 'anterior_deltoid', '{}'::text[],
   'Constant cable tension keeps the anterior deltoid loaded through the full range, unlike a dumbbell front raise which loses tension at the bottom.'),

  ('Reverse Pec Deck', 'shoulders', 'Machine',
   'Machine isolation for the rear deltoid.',
   'Facing into the pad, grip the handles with arms extended, then pull them back and out in an arc, squeezing your shoulder blades together.',
   60, array['back']::text[], 'posterior_deltoid', array['trapezius']::text[],
   'A fixed, supported arc isolates the posterior deltoid and upper back without any lower-back or momentum assistance, useful for a muscle group that''s easy to cheat on with free weights.'),

  ('Cuban Press', 'shoulders', 'Dumbbells',
   'Combination upright row, external rotation, and press for shoulder health.',
   'Pull the dumbbells up to elbow height like an upright row, rotate your forearms up until the weights are overhead-ready, then press to full extension, and reverse the sequence to lower.',
   75, '{}'::text[], 'lateral_deltoid', array['posterior_deltoid']::text[],
   'Combining a row, external rotation, and press in one rep trains the rotator cuff and shoulder stabilizers through a range most pressing movements skip entirely.'),

  ('Zottman Curl', 'arms', 'Dumbbells',
   'Curl variation that trains both the biceps and forearms in one rep.',
   'Curl the dumbbells up with palms facing up, rotate your wrists so your palms face down at the top, then lower the weight slowly with that reversed grip.',
   75, '{}'::text[], 'biceps_brachii', array['brachioradialis']::text[],
   'Curling up with a supinated grip and lowering with a pronated one trains the biceps concentrically and the forearm extensors and brachioradialis eccentrically in the same rep.'),

  ('Diamond Push-Up', 'arms', 'Bodyweight',
   'Narrow-hand push-up variation that emphasizes the triceps.',
   'With your hands close together forming a diamond shape under your chest, lower your body until your chest nearly touches your hands, then press back up.',
   60, array['chest']::text[], 'triceps_brachii', array['lower_pectoralis']::text[],
   'Narrowing the hand position increases elbow flexion range and shifts more of the pressing load onto the triceps than a standard push-up.'),

  ('Cable Overhead Tricep Extension', 'arms', 'Cable',
   'Cable isolation for the triceps performed overhead.',
   'Facing away from the cable with the rope overhead, extend your arms forward and up to full lockout, then return under control to a deep stretch.',
   60, '{}'::text[], 'triceps_brachii', '{}'::text[],
   'The overhead angle keeps the long head of the triceps under constant cable tension through its full stretched range, more directly than a pushdown.'),

  ('Dead Bug', 'core', 'Bodyweight',
   'Anti-extension core exercise performed lying on your back.',
   'Lying on your back with arms up and knees bent at 90 degrees, slowly extend one arm overhead and the opposite leg straight, keeping your lower back pressed into the floor, then return and switch sides.',
   45, '{}'::text[], 'rectus_abdominis', '{}'::text[],
   'Moving opposite limbs while keeping the lower back flat against the floor trains the deep core to resist spinal extension under load, a safer entry point than sit-ups for building core control.'),

  ('Pallof Press', 'core', 'Cable',
   'Anti-rotation core exercise performed standing side-on to a cable.',
   'Standing side-on to the cable at chest height, press the handle straight out in front of you and hold, resisting the cable pulling your torso to rotate, then return and repeat.',
   45, '{}'::text[], 'obliques', '{}'::text[],
   'Resisting the cable''s rotational pull trains the obliques and deep core isometrically to prevent rotation, a pattern most core work — which trains flexion — never addresses.'),

  ('Bicycle Crunch', 'core', 'Bodyweight',
   'Rotational crunch that alternates elbow-to-knee contact.',
   'Lying on your back with hands behind your head, bring one elbow toward the opposite knee while extending the other leg, then alternate sides in a pedaling motion.',
   45, '{}'::text[], 'rectus_abdominis', array['obliques']::text[],
   'The rotational, alternating pattern trains the rectus abdominis and obliques together in one exercise, hitting both the flexion and rotation that a static crunch misses.')
on conflict (name) do nothing;

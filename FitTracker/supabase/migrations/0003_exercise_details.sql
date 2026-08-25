-- Adds exercise detail fields (instructions, rest time, secondary muscles) and lets
-- signed-in users add their own exercises to the shared library.
-- Run this in the Supabase SQL editor after 0001_init.sql and 0002_more_exercises.sql.

alter table public.exercises
  add column if not exists instructions text,
  add column if not exists rest_seconds int,
  add column if not exists secondary_muscle_groups text[] not null default '{}',
  add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.exercises
  add constraint exercises_muscle_group_check
  check (muscle_group in ('legs', 'chest', 'back', 'shoulders', 'arms', 'core'));

alter table public.exercises
  add constraint exercises_secondary_muscle_groups_check
  check (secondary_muscle_groups <@ array['legs', 'chest', 'back', 'shoulders', 'arms', 'core']::text[]);

-- Let signed-in users add their own exercises to the shared library
create policy "Authenticated users can add exercises" on public.exercises
  for insert with check (auth.uid() is not null);

-- Backfill instructions, rest time, and secondary muscle groups for the existing library
update public.exercises as e set
  instructions = v.instructions,
  rest_seconds = v.rest_seconds,
  secondary_muscle_groups = v.secondary
from (values
  ('Barbell Back Squat', 'Bar on your upper back, feet shoulder-width. Squat until thighs are at least parallel to the floor, then drive back up through your heels.', 150, array['core']::text[]),
  ('Romanian Deadlift', 'Hinge at the hips with a slight knee bend, lowering the bar along your legs until you feel a hamstring stretch, then drive your hips forward to stand.', 120, array['back']::text[]),
  ('Leg Press', 'Set your feet shoulder-width on the platform, lower until your knees reach about 90 degrees, then press back to full extension without locking out.', 120, '{}'::text[]),
  ('Walking Lunge', 'Step forward into a lunge until both knees are near 90 degrees, then drive through the front heel to step into the next lunge.', 90, array['core']::text[]),
  ('Standing Calf Raise', 'Rise onto the balls of your feet as high as possible, pause, then lower under control until you feel a stretch in your calves.', 60, '{}'::text[]),
  ('Barbell Bench Press', 'Lower the bar to your mid-chest with control, keeping your shoulder blades pinned, then press back up to full extension.', 150, array['shoulders', 'arms']::text[]),
  ('Incline Dumbbell Press', 'On an incline bench, press the dumbbells up and slightly together until your arms are extended, then lower under control to chest level.', 120, array['shoulders', 'arms']::text[]),
  ('Cable Chest Fly', 'With a slight bend in your elbows, bring the cables together in front of your chest in a wide arc, then return under control.', 75, array['shoulders']::text[]),
  ('Push-Up', 'Keep your body in a straight line as you lower your chest to the floor, then press back up to full arm extension.', 60, array['shoulders', 'arms', 'core']::text[]),
  ('Pull-Up', 'Hang from the bar with an overhand grip, pull your chin above the bar, then lower under control to a full hang.', 120, array['arms']::text[]),
  ('Barbell Row', 'Hinge forward with a flat back, pull the bar to your lower ribs, then lower under control without losing your hip hinge.', 120, array['arms']::text[]),
  ('Lat Pulldown', 'Pull the bar down to your upper chest while keeping your torso mostly upright, then let it rise under control to full extension.', 90, array['arms']::text[]),
  ('Seated Cable Row', 'Pull the handle to your torso while keeping your back straight, then extend your arms fully without rounding forward.', 90, array['arms']::text[]),
  ('Deadlift', 'With a flat back, grip the bar just outside your legs, drive through your heels to stand tall, then lower the bar back to the floor under control.', 180, array['legs', 'core']::text[]),
  ('Overhead Press', 'Press the bar from shoulder height straight overhead until your arms are locked out, then lower back to your shoulders under control.', 120, array['arms']::text[]),
  ('Lateral Raise', 'With a slight bend in your elbows, raise the dumbbells out to the sides until they reach shoulder height, then lower under control.', 60, '{}'::text[]),
  ('Rear Delt Fly', 'Hinge forward slightly and raise the dumbbells out to the sides, squeezing your shoulder blades together at the top.', 60, array['back']::text[]),
  ('Barbell Curl', 'Keeping your elbows pinned to your sides, curl the bar up to shoulder height, then lower under control to full extension.', 75, '{}'::text[]),
  ('Hammer Curl', 'With a neutral grip, curl the dumbbells up while keeping your elbows fixed, then lower under control.', 75, '{}'::text[]),
  ('Tricep Pushdown', 'Keeping your elbows pinned to your sides, push the bar or rope down to full extension, then let it rise under control.', 60, '{}'::text[]),
  ('Skull Crusher', 'Lower the bar toward your forehead by bending only at the elbows, then extend back to lockout.', 75, '{}'::text[]),
  ('Plank', 'Hold a straight line from head to heels on your forearms and toes, bracing your abs and glutes throughout.', 45, '{}'::text[]),
  ('Hanging Leg Raise', 'Hang from the bar and raise your legs until roughly parallel to the floor, then lower under control without swinging.', 60, '{}'::text[]),
  ('Cable Crunch', 'Kneel below the cable, curl your torso down by contracting your abs, then return under control.', 60, '{}'::text[]),
  ('Front Squat', 'With the bar racked across your front shoulders, squat until your thighs are at least parallel, keeping your torso upright, then drive back up.', 150, array['core']::text[]),
  ('Bulgarian Split Squat', 'With your rear foot elevated behind you, lower your back knee toward the floor, then drive through your front heel to stand.', 90, array['core']::text[]),
  ('Leg Extension', 'Extend your legs fully against the pad, squeeze your quads at the top, then lower under control.', 60, '{}'::text[]),
  ('Lying Leg Curl', 'Curl your heels toward your glutes against the pad, squeeze at the top, then lower under control.', 60, '{}'::text[]),
  ('Hip Thrust', 'With your upper back on a bench and the bar over your hips, drive your hips up until your body forms a straight line, then lower under control.', 120, array['core']::text[]),
  ('Goblet Squat', 'Hold a dumbbell at your chest and squat down between your knees, then drive back up to standing.', 90, array['core']::text[]),
  ('Seated Calf Raise', 'With the pad on your knees, rise onto the balls of your feet, pause, then lower under control until you feel a stretch.', 60, '{}'::text[]),
  ('Hack Squat', 'With your back against the pad, squat down until your knees reach about 90 degrees, then press back to standing.', 120, '{}'::text[]),
  ('Glute Bridge', 'Lying on your back with knees bent, drive your hips up by squeezing your glutes, then lower under control.', 60, array['core']::text[]),
  ('Step-Up', 'Step fully onto an elevated platform, driving through your front heel until standing tall, then step back down under control.', 90, array['core']::text[]),
  ('Decline Barbell Press', 'On a decline bench, lower the bar to your lower chest, then press back up to full extension.', 120, array['arms']::text[]),
  ('Flat Dumbbell Press', 'Press the dumbbells up and slightly together until your arms are extended, then lower under control to chest level.', 120, array['shoulders', 'arms']::text[]),
  ('Incline Barbell Press', 'On an incline bench, lower the bar to your upper chest, then press back up to full extension.', 120, array['shoulders']::text[]),
  ('Dumbbell Fly', 'With a slight bend in your elbows, lower the dumbbells out to your sides until you feel a chest stretch, then bring them back together above your chest.', 75, array['shoulders']::text[]),
  ('Pec Deck', 'Bring the pads together in front of your chest in a controlled arc, then let them return under control.', 75, '{}'::text[]),
  ('Dips', 'Lower your body until your shoulders are below your elbows, leaning forward for more chest emphasis, then press back to full extension.', 90, array['arms']::text[]),
  ('Landmine Press', 'Press the barbell end up and away from your shoulder along its natural arc, then lower under control.', 90, array['shoulders']::text[]),
  ('Chin-Up', 'Hang from the bar with an underhand grip, pull your chin above the bar, then lower under control.', 120, array['arms']::text[]),
  ('T-Bar Row', 'Hinge forward with a flat back and pull the handle to your torso, then lower under control.', 120, array['arms']::text[]),
  ('Single-Arm Dumbbell Row', 'With one hand and knee braced on a bench, pull the dumbbell to your hip, then lower under control.', 90, array['arms']::text[]),
  ('Face Pull', 'Pull the rope toward your face, flaring your elbows out and squeezing your shoulder blades together.', 60, array['shoulders']::text[]),
  ('Straight-Arm Pulldown', 'With arms mostly straight, pull the bar down toward your thighs using your lats, then let it rise under control.', 60, '{}'::text[]),
  ('Rack Pull', 'From knee height, pull the bar up by driving your hips forward until standing tall, then lower under control.', 150, array['legs']::text[]),
  ('Chest-Supported Row', 'With your chest braced against the pad, pull the handles to your torso, then extend your arms under control.', 90, array['arms']::text[]),
  ('Arnold Press', 'Start with palms facing you at shoulder height, press up while rotating your palms forward, then reverse the motion on the way down.', 90, array['arms']::text[]),
  ('Dumbbell Shoulder Press', 'Press the dumbbells overhead from shoulder height until your arms are extended, then lower under control.', 90, array['arms']::text[]),
  ('Front Raise', 'Raise the dumbbells straight out in front of you to shoulder height, then lower under control.', 60, '{}'::text[]),
  ('Cable Lateral Raise', 'With the cable at your side, raise your arm out to shoulder height, then lower under control.', 60, '{}'::text[]),
  ('Upright Row', 'Pull the bar straight up along your body to about chest height, leading with your elbows, then lower under control.', 75, array['back']::text[]),
  ('Shrug', 'Holding weight at your sides, shrug your shoulders straight up toward your ears, then lower under control.', 60, '{}'::text[]),
  ('Preacher Curl', 'With your arm braced on the pad, curl the weight up to shoulder height, then lower under control until your arm is fully extended.', 75, '{}'::text[]),
  ('Concentration Curl', 'With your elbow braced against your inner thigh, curl the dumbbell up, squeezing at the top, then lower under control.', 60, '{}'::text[]),
  ('Cable Curl', 'Keeping your elbows pinned to your sides, curl the cable up to shoulder height, then lower under control.', 60, '{}'::text[]),
  ('Overhead Tricep Extension', 'With the weight behind your head, extend your arms overhead by straightening at the elbow, then lower under control.', 75, array['shoulders']::text[]),
  ('Close-Grip Bench Press', 'With hands shoulder-width or closer, lower the bar to your chest keeping elbows tucked, then press back to full extension.', 120, array['chest']::text[]),
  ('Dumbbell Kickback', 'Hinge forward with your upper arm parallel to the floor, extend your forearm back until straight, then return under control.', 60, '{}'::text[]),
  ('Russian Twist', 'Sitting with your torso leaned back, rotate side to side while keeping your chest up and core braced.', 45, '{}'::text[]),
  ('Ab Wheel Rollout', 'From your knees, roll the wheel forward while keeping your core braced, then pull back to the start using your abs.', 75, array['shoulders', 'back']::text[]),
  ('Side Plank', 'Balance on one forearm and the side of your foot, keeping your body in a straight line, then hold.', 45, '{}'::text[]),
  ('Mountain Climber', 'From a plank position, drive your knees toward your chest one at a time at a quick pace, keeping your core braced.', 45, array['legs']::text[]),
  ('Sit-Up', 'With your knees bent, curl your torso all the way up toward your knees, then lower back under control.', 45, '{}'::text[]),
  ('Toes to Bar', 'Hang from the bar and raise your legs all the way up until your toes touch the bar, then lower under control without swinging.', 75, array['arms']::text[])
) as v(name, instructions, rest_seconds, secondary)
where e.name = v.name;

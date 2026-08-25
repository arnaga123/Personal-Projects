import "server-only";
import { createClient } from "@/lib/supabase/server";

export type VolumePoint = { date: string; volume: number };
export type ExerciseProgressPoint = { date: string; weight: number };

type WorkoutRow = {
  id: string;
  date: string;
  workout_sets: {
    reps: number;
    weight: number;
    exercise_id: string;
    exercises: { name: string } | null;
  }[];
};

export async function getDashboardData(userId: string) {
  const supabase = await createClient();

  const { data: workouts } = await supabase
    .from("workouts")
    .select("id, date, workout_sets(reps, weight, exercise_id, exercises(name))")
    .eq("user_id", userId)
    .order("date", { ascending: true })
    .returns<WorkoutRow[]>();

  const sessions = workouts ?? [];

  const volumeByDate = new Map<string, number>();
  const exerciseTotals = new Map<string, number>();
  const topSetByExerciseAndDate = new Map<string, Map<string, number>>();

  for (const w of sessions) {
    let dayVolume = 0;
    for (const s of w.workout_sets ?? []) {
      const setVolume = (s.reps ?? 0) * (s.weight ?? 0);
      dayVolume += setVolume;

      const exName = s.exercises?.name ?? "Unknown";
      exerciseTotals.set(exName, (exerciseTotals.get(exName) ?? 0) + setVolume);

      if (!topSetByExerciseAndDate.has(exName)) {
        topSetByExerciseAndDate.set(exName, new Map());
      }
      const byDate = topSetByExerciseAndDate.get(exName)!;
      byDate.set(w.date, Math.max(byDate.get(w.date) ?? 0, s.weight ?? 0));
    }
    volumeByDate.set(w.date, (volumeByDate.get(w.date) ?? 0) + dayVolume);
  }

  const volumeSeries: VolumePoint[] = Array.from(volumeByDate.entries()).map(
    ([date, volume]) => ({ date, volume })
  );

  const topExercise = Array.from(exerciseTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

  const strengthSeries: ExerciseProgressPoint[] = topExercise
    ? Array.from(topSetByExerciseAndDate.get(topExercise)!.entries())
        .map(([date, weight]) => ({ date, weight }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : [];

  const workoutDates = sessions.map((w) => w.date).sort();
  const streak = computeStreak(workoutDates);

  return {
    totalWorkouts: sessions.length,
    volumeSeries,
    strengthSeries,
    topExercise,
    streak,
  };
}

function computeStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0;

  const unique = new Set(sortedDates);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cursor = new Date(today);
  const todayStr = toDateStr(cursor);
  if (!unique.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (unique.has(toDateStr(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

import { getExercises } from "@/lib/data/exercises";
import { WorkoutLogger } from "@/components/workout-logger";

export default async function LogPage() {
  const exercises = await getExercises();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Log</p>
        <h1 className="mt-1 text-balance font-display text-3xl font-medium">New workout</h1>
      </div>

      {exercises.length === 0 ? (
        <p className="text-sm text-muted">
          No exercises found yet — run the seed migration in Supabase, then refresh.
        </p>
      ) : (
        <WorkoutLogger exercises={exercises} />
      )}
    </div>
  );
}

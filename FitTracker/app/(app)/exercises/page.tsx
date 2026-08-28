import Link from "next/link";
import { getExercises } from "@/lib/data/exercises";
import { AddExerciseForm } from "@/components/add-exercise-form";

export default async function ExercisesPage() {
  const exercises = await getExercises();
  const grouped = exercises.reduce<Record<string, typeof exercises>>((acc, ex) => {
    (acc[ex.muscle_group] ??= []).push(ex);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Exercises</p>
        <h1 className="mt-1 text-balance font-display text-3xl font-medium">Exercise library</h1>
        <p className="mt-1 text-sm text-muted">
          Tap an exercise for form cues, rest time, and which muscles it hits.
        </p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <p className="text-sm text-muted">Seed the exercise library first (see README).</p>
      ) : (
        Object.entries(grouped).map(([group, list]) => (
          <div key={group}>
            <h2 className="font-display text-lg font-medium capitalize">{group}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((ex) => (
                <Link
                  key={ex.id}
                  href={`/exercises/${ex.id}`}
                  className="border border-border bg-background p-4 transition-colors duration-150 hover:bg-surface"
                >
                  <p className="line-clamp-2 text-sm font-semibold">{ex.name}</p>
                  {ex.equipment && <p className="mt-0.5 text-xs text-muted">{ex.equipment}</p>}
                  {ex.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{ex.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))
      )}

      <div className="border-t border-border pt-8">
        <AddExerciseForm />
      </div>
    </div>
  );
}

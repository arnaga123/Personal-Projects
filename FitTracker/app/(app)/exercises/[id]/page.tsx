import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getExercise } from "@/lib/data/exercises";
import { BodyDiagram } from "@/components/body-diagram";
import type { MuscleGroup } from "@/lib/muscle-groups";
import { isSpecificMuscle, SPECIFIC_MUSCLE_LABELS, type SpecificMuscle } from "@/lib/specific-muscles";

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const exercise = await getExercise(id);

  if (!exercise) {
    notFound();
  }

  const secondary = (exercise.secondary_muscle_groups ?? []) as MuscleGroup[];
  const specificMuscle = isSpecificMuscle(exercise.specific_muscle) ? exercise.specific_muscle : undefined;
  const specificSecondary = ((exercise.specific_secondary_muscles ?? []) as string[]).filter(isSpecificMuscle) as SpecificMuscle[];
  const primaryLabel = specificMuscle ? SPECIFIC_MUSCLE_LABELS[specificMuscle] : exercise.muscle_group;

  return (
    <div className="flex flex-col gap-8">
      <Link href="/exercises" className="flex w-fit items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft size={16} aria-hidden="true" /> Back to library
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted capitalize">
          {exercise.muscle_group}
          {exercise.equipment ? ` · ${exercise.equipment}` : ""}
        </p>
        <h1 className="mt-1 text-balance font-display text-3xl font-medium">{exercise.name}</h1>
        {exercise.description && <p className="mt-2 text-muted">{exercise.description}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <BodyDiagram
          primary={exercise.muscle_group as MuscleGroup}
          secondary={secondary}
          specificMuscle={specificMuscle}
          specificSecondaryMuscles={specificSecondary}
        />

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-lg shadow-black/20">
            <h2 className="font-display text-lg font-medium">How to perform it</h2>
            <p className="mt-3 whitespace-pre-line text-sm text-muted">
              {exercise.instructions ?? "No instructions added yet."}
            </p>
          </div>

          {exercise.common_mistakes && (
            <div className="rounded-xl border border-danger/40 bg-surface p-6 shadow-lg shadow-black/20">
              <h2 className="font-display text-lg font-medium text-danger">Common mistakes to avoid</h2>
              <p className="mt-3 text-sm text-muted">{exercise.common_mistakes}</p>
            </div>
          )}

          {exercise.beginner_tips && (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-lg shadow-black/20">
              <h2 className="font-display text-lg font-medium">Tips if you&apos;re new to this</h2>
              <p className="mt-3 text-sm text-muted">{exercise.beginner_tips}</p>
            </div>
          )}

          {exercise.why_effective && (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-lg shadow-black/20">
              <h2 className="font-display text-lg font-medium">Why it&apos;s effective</h2>
              <p className="mt-3 text-sm text-muted">{exercise.why_effective}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-lg shadow-black/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Primary muscle</p>
              <p className="mt-2 font-display text-xl font-medium capitalize text-accent">{primaryLabel}</p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5 shadow-lg shadow-black/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Rest between sets</p>
              <p className="mt-2 font-display text-xl font-medium">
                {exercise.rest_seconds ? formatRest(exercise.rest_seconds) : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5 shadow-lg shadow-black/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Equipment needed</p>
              <p className="mt-2 font-display text-xl font-medium">{exercise.equipment ?? "None"}</p>
            </div>
          </div>

          {(specificSecondary.length > 0 || secondary.length > 0) && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-lg shadow-black/20">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Secondary muscles</p>
              <p className="mt-2 text-sm capitalize text-foreground">
                {specificSecondary.length > 0
                  ? specificSecondary.map((m) => SPECIFIC_MUSCLE_LABELS[m]).join(", ")
                  : secondary.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatRest(seconds: number) {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} sec`;
}

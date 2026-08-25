import { verifySession } from "@/lib/dal";
import { getSplits } from "@/lib/data/splits";
import { getExercises } from "@/lib/data/exercises";
import { SplitsList } from "@/components/splits-list";
import { SplitBuilder } from "@/components/split-builder";
import { RecommendedSplitCard } from "@/components/recommended-split-card";
import { resolveSplitTemplates } from "@/lib/split-templates";

export default async function SplitsPage() {
  const user = await verifySession();
  const [splits, exercises] = await Promise.all([getSplits(user.id), getExercises()]);
  const templates = resolveSplitTemplates(exercises);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Splits</p>
        <h1 className="mt-1 font-display text-3xl font-medium">Your training splits</h1>
      </div>

      <SplitsList splits={splits} />

      {templates.length > 0 && (
        <div className="border-t border-border pt-8">
          <h2 className="font-display text-xl font-medium">Recommended splits</h2>
          <p className="mt-1 text-sm text-muted">
            Pre-built splits based on common training patterns — add one in a click, then edit it however you like.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {templates.map((template) => (
              <RecommendedSplitCard key={template.name} template={template} />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-8">
        <h2 className="font-display text-xl font-medium">Build a new split</h2>
        <p className="mt-1 text-sm text-muted">
          Pick how many days a week you can train, then fill in each day.
        </p>
        <div className="mt-6">
          {exercises.length === 0 ? (
            <p className="text-sm text-muted">Seed the exercise library first (see README).</p>
          ) : (
            <SplitBuilder exercises={exercises} />
          )}
        </div>
      </div>
    </div>
  );
}

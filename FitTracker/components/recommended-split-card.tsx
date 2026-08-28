"use client";

import { useActionState } from "react";
import { createSplit } from "@/app/actions/splits";
import { Button } from "@/components/ui/button";
import type { ResolvedSplitTemplate } from "@/lib/split-templates";

export function RecommendedSplitCard({ template }: { template: ResolvedSplitTemplate }) {
  const [state, action, pending] = useActionState(createSplit, undefined);

  const days = template.days.map((d) => ({
    name: d.name,
    exerciseIds: d.exercises.map((e) => e.id),
  }));

  return (
    // Nike's own way to make one thing stand out in a monochrome system:
    // invert to full ink black instead of a colored glow (member-benefit-card).
    <form action={action} className="flex flex-col bg-accent p-5 text-accent-foreground">
      <input type="hidden" name="name" value={template.name} />
      <input type="hidden" name="daysPerWeek" value={template.daysPerWeek} />
      <input type="hidden" name="days" value={JSON.stringify(days)} />

      <span className="w-fit text-[10px] font-medium uppercase tracking-wide text-accent-foreground/70">
        Recommended for you
      </span>
      <h3 className="mt-3 font-display text-lg font-medium">{template.name}</h3>
      <p className="text-xs uppercase tracking-wide text-accent-foreground/70">
        {template.daysPerWeek} days / week
      </p>

      <div className="mt-4 flex flex-col gap-2">
        {template.days.map((day) => (
          <div key={day.name}>
            <p className="text-sm font-medium">{day.name}</p>
            <p className="text-sm text-accent-foreground/70">
              {day.exercises.map((e) => e.name).join(", ")}
            </p>
          </div>
        ))}
      </div>

      {state?.error && <p className="mt-3 text-sm text-danger-on-accent">{state.error}</p>}

      <Button type="submit" variant="secondary" disabled={pending} className="mt-4 w-fit">
        {pending ? "Adding…" : "Use this split"}
      </Button>
    </form>
  );
}

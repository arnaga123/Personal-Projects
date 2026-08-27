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
    <form
      action={action}
      className="relative flex flex-col overflow-hidden rounded-xl border border-accent/30 bg-surface p-5 shadow-lg shadow-accent/5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-xl hover:shadow-accent/10"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/10 blur-2xl" />
      <input type="hidden" name="name" value={template.name} />
      <input type="hidden" name="daysPerWeek" value={template.daysPerWeek} />
      <input type="hidden" name="days" value={JSON.stringify(days)} />

      <span className="relative w-fit rounded-full bg-accent/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-accent">
        Recommended for you
      </span>
      <h3 className="relative mt-3 font-display text-lg font-medium">{template.name}</h3>
      <p className="relative text-xs uppercase tracking-wide text-muted">{template.daysPerWeek} days / week</p>

      <div className="mt-4 flex flex-col gap-2">
        {template.days.map((day) => (
          <div key={day.name}>
            <p className="text-sm font-semibold">{day.name}</p>
            <p className="text-sm text-muted">{day.exercises.map((e) => e.name).join(", ")}</p>
          </div>
        ))}
      </div>

      {state?.error && <p className="mt-3 text-sm text-danger">{state.error}</p>}

      <Button type="submit" variant="secondary" disabled={pending} className="mt-4 w-fit">
        {pending ? "Adding…" : "Use this split"}
      </Button>
    </form>
  );
}

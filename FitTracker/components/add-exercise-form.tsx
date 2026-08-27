"use client";

import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createExercise } from "@/app/actions/exercises";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/lib/muscle-groups";

export function AddExerciseForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createExercise, undefined);
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("chest");
  const [secondary, setSecondary] = useState<MuscleGroup[]>([]);

  function toggleSecondary(group: MuscleGroup) {
    setSecondary((prev) => (prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]));
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm font-semibold uppercase tracking-wide text-muted transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-accent"
      >
        <Plus size={16} /> Add exercise
      </button>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-6 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-medium">Add an exercise</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close form"
          className="text-muted hover:text-foreground"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <input type="hidden" name="secondaryMuscleGroups" value={JSON.stringify(secondary)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" required placeholder="Cable Pullover" />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Primary muscle group
          </span>
          <select
            name="muscleGroup"
            value={muscleGroup}
            onChange={(e) => {
              const next = e.target.value as MuscleGroup;
              setMuscleGroup(next);
              setSecondary((prev) => prev.filter((g) => g !== next));
            }}
            className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm capitalize focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]"
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <Field label="Equipment (optional)" name="equipment" placeholder="Cable" />
        <Field label="Rest time (seconds)" name="restSeconds" type="number" min={15} max={600} defaultValue={90} />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Short description (optional)
        </span>
        <input
          type="text"
          name="description"
          placeholder="One line on what this targets"
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          How to perform it (optional)
        </span>
        <textarea
          name="instructions"
          rows={3}
          placeholder="Step-by-step form cues"
          className="rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]"
        />
      </label>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Secondary muscles (optional)
        </span>
        <div className="mt-2 flex flex-wrap gap-3">
          {MUSCLE_GROUPS.filter((g) => g !== muscleGroup).map((g) => (
            <label key={g} className="flex items-center gap-2 text-sm capitalize text-muted">
              <input
                type="checkbox"
                checked={secondary.includes(g)}
                onChange={() => toggleSecondary(g)}
                className="accent-[#ffb340]"
              />
              {g}
            </label>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Adding…" : "Add exercise"}
      </Button>
    </form>
  );
}

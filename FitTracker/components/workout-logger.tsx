"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { logWorkout } from "@/app/actions/workouts";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Exercise = { id: string; name: string; muscle_group: string };
type SetRow = { exerciseId: string; reps: string; weight: string; unit: "lb" | "kg" };

export function WorkoutLogger({ exercises }: { exercises: Exercise[] }) {
  const [state, action, pending] = useActionState(logWorkout, undefined);
  const [rows, setRows] = useState<SetRow[]>([
    { exerciseId: exercises[0]?.id ?? "", reps: "", weight: "", unit: "lb" },
  ]);

  function addRow() {
    setRows((r) => [...r, { exerciseId: exercises[0]?.id ?? "", reps: "", weight: "", unit: "lb" }]);
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  function updateRow(index: number, patch: Partial<SetRow>) {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  const validSets = rows
    .filter((r) => r.exerciseId && r.reps && r.weight)
    .map((r) => ({ exerciseId: r.exerciseId, reps: Number(r.reps), weight: Number(r.weight), unit: r.unit }));

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="sets" value={JSON.stringify(validSets)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Date</span>
          <input
            type="date"
            name="date"
            required
            defaultValue={new Date().toISOString().slice(0, 10)}
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Notes (optional)
          </span>
          <input
            type="text"
            name="notes"
            placeholder="Felt strong, upped bench 5lb"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]"
          />
        </label>
      </div>

      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border shadow-lg shadow-black/20">
        <div className="hidden grid-cols-[1fr_90px_100px_70px_40px] gap-3 bg-surface px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted sm:grid">
          <span>Exercise</span>
          <span>Reps</span>
          <span>Weight</span>
          <span>Unit</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-[1fr_90px_100px_70px_40px] sm:items-center sm:p-3"
          >
            <select
              value={row.exerciseId}
              onChange={(e) => updateRow(index, { exerciseId: e.target.value })}
              aria-label={`Exercise for set ${index + 1}`}
              className="col-span-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)] sm:col-span-1"
            >
              {exercises.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              placeholder="Reps"
              value={row.reps}
              onChange={(e) => updateRow(index, { reps: e.target.value })}
              aria-label={`Reps for set ${index + 1}`}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]"
            />
            <input
              type="number"
              min={0}
              step="0.5"
              placeholder="Weight"
              value={row.weight}
              onChange={(e) => updateRow(index, { weight: e.target.value })}
              aria-label={`Weight for set ${index + 1}`}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]"
            />
            <select
              value={row.unit}
              onChange={(e) => updateRow(index, { unit: e.target.value as "lb" | "kg" })}
              aria-label={`Weight unit for set ${index + 1}`}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]"
            >
              <option value="lb">lb</option>
              <option value="kg">kg</option>
            </select>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length === 1}
              aria-label={`Remove set ${index + 1}`}
              className="flex items-center justify-center text-muted hover:text-danger disabled:opacity-30"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={addRow} className={cn(buttonVariants("secondary"), "w-fit")}>
        <Plus size={16} /> Add set
      </button>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save workout"}
      </Button>
    </form>
  );
}

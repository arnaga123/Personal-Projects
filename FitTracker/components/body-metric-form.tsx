"use client";

import { useActionState } from "react";
import { logBodyMetric } from "@/app/actions/progress";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function BodyMetricForm() {
  const [state, action, pending] = useActionState(logBodyMetric, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Date"
          name="date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
        <Field label="Weight" name="weight" type="number" step="0.1" placeholder="Optional" />
        <Field label="Chest (in)" name="chest" type="number" step="0.1" placeholder="Optional" />
        <Field label="Waist (in)" name="waist" type="number" step="0.1" placeholder="Optional" />
        <Field label="Arms (in)" name="arms" type="number" step="0.1" placeholder="Optional" />
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Photo (optional)
          </span>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-muted file:mr-3 file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:text-accent-foreground"
          />
        </label>
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save entry"}
      </Button>
    </form>
  );
}

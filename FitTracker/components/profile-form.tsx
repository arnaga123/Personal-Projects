"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

type Profile = {
  name: string | null;
  goal: string | null;
  experience_level: string | null;
  days_per_week_pref: number | null;
} | null;

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="flex max-w-lg flex-col gap-5">
      <Field label="Name" name="name" defaultValue={profile?.name ?? ""} required />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Goal</span>
        <select
          name="goal"
          defaultValue={profile?.goal ?? "maintain"}
          className="rounded-xl border border-transparent bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:bg-background focus:ring-4 focus:ring-surface"
        >
          <option value="bulk">Bulk</option>
          <option value="cut">Cut</option>
          <option value="maintain">Maintain</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Experience level
        </span>
        <select
          name="experienceLevel"
          defaultValue={profile?.experience_level ?? "beginner"}
          className="rounded-xl border border-transparent bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:bg-background focus:ring-4 focus:ring-surface"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </label>

      <Field
        label="Preferred days per week"
        name="daysPerWeekPref"
        type="number"
        min={1}
        max={7}
        defaultValue={profile?.days_per_week_pref ?? 3}
        required
      />

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
      {state?.success && <p className="text-sm text-success">Saved.</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

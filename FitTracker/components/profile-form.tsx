"use client";

import { useActionState, useState } from "react";
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
  const [goal, setGoal] = useState(profile?.goal ?? "maintain");
  const [experienceLevel, setExperienceLevel] = useState(profile?.experience_level ?? "beginner");

  return (
    <form action={action} className="flex max-w-lg flex-col gap-5">
      <Field label="Name" name="name" defaultValue={profile?.name ?? ""} required />

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">Goal</span>
        <select
          name="goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
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
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value)}
          className="border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
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
      {state?.success && <p className="text-sm text-accent">Saved.</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

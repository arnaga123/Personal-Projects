"use client";

import { useActionState, useState } from "react";
import { completeOnboarding } from "@/app/actions/onboarding";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const GOALS = [
  { value: "bulk", label: "Build muscle", hint: "Bulk — eat and lift to add size" },
  { value: "cut", label: "Lose fat", hint: "Cut — lean out while keeping strength" },
  { value: "maintain", label: "Stay consistent", hint: "Maintain — keep what you've built" },
] as const;

const LEVELS = [
  { value: "beginner", label: "Beginner", hint: "New to structured training" },
  { value: "intermediate", label: "Intermediate", hint: "6+ months of consistent training" },
  { value: "advanced", label: "Advanced", hint: "Years of structured, progressive training" },
] as const;

const STEPS = ["goal", "experience", "days"] as const;

export function OnboardingWizard({ name }: { name?: string }) {
  const [state, action, pending] = useActionState(completeOnboarding, undefined);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [daysPerWeekPref, setDaysPerWeekPref] = useState(3);

  const stepKey = STEPS[step];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Step {step + 1} of {STEPS.length}
        </p>
        <h1 className="mt-1 font-display text-2xl font-medium">
          {stepKey === "goal" && (name ? `Welcome, ${name}. What's your goal?` : "What's your goal?")}
          {stepKey === "experience" && "How experienced are you?"}
          {stepKey === "days" && "How many days a week can you train?"}
        </h1>
        {stepKey !== "days" && (
          <p className="mt-1 text-sm text-muted">This sets up where your training should start.</p>
        )}
      </div>

      {stepKey === "goal" && (
        <div className="flex flex-col gap-3">
          {GOALS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => {
                setGoal(g.value);
                setStep(1);
              }}
              className="flex flex-col items-start gap-0.5 rounded-lg border border-border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-surface-hover hover:shadow-lg hover:shadow-black/20"
            >
              <span className="text-sm font-semibold">{g.label}</span>
              <span className="text-xs text-muted">{g.hint}</span>
            </button>
          ))}
        </div>
      )}

      {stepKey === "experience" && (
        <div className="flex flex-col gap-3">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => {
                setExperienceLevel(l.value);
                setStep(2);
              }}
              className="flex flex-col items-start gap-0.5 rounded-lg border border-border px-4 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:bg-surface-hover hover:shadow-lg hover:shadow-black/20"
            >
              <span className="text-sm font-semibold">{l.label}</span>
              <span className="text-xs text-muted">{l.hint}</span>
            </button>
          ))}
        </div>
      )}

      {stepKey === "days" && goal && experienceLevel && (
        <form action={action} className="flex flex-col gap-6">
          <input type="hidden" name="goal" value={goal} />
          <input type="hidden" name="experienceLevel" value={experienceLevel} />
          <input type="hidden" name="daysPerWeekPref" value={daysPerWeekPref} />
          <div className="grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDaysPerWeekPref(d)}
                className={cn(
                  "rounded-lg border border-border py-2.5 text-sm font-semibold transition duration-200",
                  daysPerWeekPref === d
                    ? "border-accent bg-accent text-accent-foreground shadow-[0_0_16px_-2px_rgba(255,179,64,0.5)]"
                    : "hover:-translate-y-0.5 hover:border-accent"
                )}
              >
                {d}
              </button>
            ))}
          </div>
          {state?.error && <p className="text-sm text-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className={buttonVariants("primary")}>
            {pending ? "Setting up…" : "Get started"}
          </button>
        </form>
      )}

      <div className="flex items-center justify-between text-xs text-muted">
        {step > 0 ? (
          <button type="button" onClick={() => setStep(step - 1)} className="hover:text-foreground">
            Back
          </button>
        ) : (
          <span />
        )}
        <form action={action}>
          <input type="hidden" name="goal" value={goal ?? "maintain"} />
          <input type="hidden" name="experienceLevel" value={experienceLevel ?? "beginner"} />
          <input type="hidden" name="daysPerWeekPref" value={daysPerWeekPref} />
          <button type="submit" disabled={pending} className="underline underline-offset-4 hover:text-foreground">
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
}

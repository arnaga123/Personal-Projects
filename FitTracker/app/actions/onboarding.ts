"use server";

import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { OnboardingSchema } from "@/lib/validations/onboarding";

export type OnboardingState = { error?: string } | undefined;

export async function completeOnboarding(_state: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await verifySession();

  const parsed = OnboardingSchema.safeParse({
    goal: formData.get("goal"),
    experienceLevel: formData.get("experienceLevel"),
    daysPerWeekPref: formData.get("daysPerWeekPref"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    goal: parsed.data.goal,
    experience_level: parsed.data.experienceLevel,
    days_per_week_pref: parsed.data.daysPerWeekPref,
    onboarding_completed_at: new Date().toISOString(),
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

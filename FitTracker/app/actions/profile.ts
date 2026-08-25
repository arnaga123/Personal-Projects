"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { ProfileSchema } from "@/lib/validations/profile";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function updateProfile(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await verifySession();

  const parsed = ProfileSchema.safeParse({
    name: formData.get("name"),
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
    name: parsed.data.name,
    goal: parsed.data.goal,
    experience_level: parsed.data.experienceLevel,
    days_per_week_pref: parsed.data.daysPerWeekPref,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

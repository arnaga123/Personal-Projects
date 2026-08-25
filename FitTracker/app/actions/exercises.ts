"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { ExerciseSchema } from "@/lib/validations/exercise";

export type ActionState = { error?: string } | undefined;

export async function createExercise(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await verifySession();

  let secondaryMuscleGroups: unknown;
  try {
    secondaryMuscleGroups = JSON.parse(String(formData.get("secondaryMuscleGroups") ?? "[]"));
  } catch {
    return { error: "Could not read secondary muscle groups." };
  }

  const parsed = ExerciseSchema.safeParse({
    name: formData.get("name"),
    muscleGroup: formData.get("muscleGroup"),
    equipment: formData.get("equipment") || undefined,
    description: formData.get("description") || undefined,
    instructions: formData.get("instructions") || undefined,
    restSeconds: formData.get("restSeconds") || undefined,
    secondaryMuscleGroups,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid exercise." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("exercises").insert({
    name: parsed.data.name,
    muscle_group: parsed.data.muscleGroup,
    equipment: parsed.data.equipment ?? null,
    description: parsed.data.description ?? null,
    instructions: parsed.data.instructions ?? null,
    rest_seconds: parsed.data.restSeconds ?? null,
    secondary_muscle_groups: parsed.data.secondaryMuscleGroups,
    created_by: user.id,
  });

  if (error) {
    return {
      error: error.message.toLowerCase().includes("duplicate")
        ? "An exercise with this name already exists."
        : error.message,
    };
  }

  revalidatePath("/exercises");
  return undefined;
}

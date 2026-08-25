"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { WorkoutSchema } from "@/lib/validations/workout";

export type ActionState = { error?: string } | undefined;

export async function logWorkout(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await verifySession();

  let sets: unknown;
  try {
    sets = JSON.parse(String(formData.get("sets") ?? "[]"));
  } catch {
    return { error: "Could not read the logged sets." };
  }

  const parsed = WorkoutSchema.safeParse({
    date: formData.get("date"),
    notes: formData.get("notes") || undefined,
    sets,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid workout." };
  }

  if (parsed.data.sets.length === 0) {
    return { error: "Add at least one set before saving." };
  }

  const supabase = await createClient();

  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .insert({ user_id: user.id, date: parsed.data.date, notes: parsed.data.notes ?? null })
    .select("id")
    .single();

  if (workoutError || !workout) {
    return { error: workoutError?.message ?? "Could not save workout." };
  }

  const rows = parsed.data.sets.map((s, index) => ({
    workout_id: workout.id,
    exercise_id: s.exerciseId,
    set_index: index,
    reps: s.reps,
    weight: s.weight,
    unit: s.unit,
  }));

  const { error: setsError } = await supabase.from("workout_sets").insert(rows);

  if (setsError) {
    return { error: setsError.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

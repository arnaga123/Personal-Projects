import "server-only";
import { createClient } from "@/lib/supabase/server";

const EXERCISE_COLUMNS =
  "id, name, muscle_group, equipment, description, instructions, rest_seconds, secondary_muscle_groups, specific_muscle, specific_secondary_muscles, why_effective";

export async function getExercises() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("exercises")
    .select(EXERCISE_COLUMNS)
    .order("muscle_group")
    .order("name");
  return data ?? [];
}

export async function getExercise(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("exercises").select(EXERCISE_COLUMNS).eq("id", id).single();
  return data;
}

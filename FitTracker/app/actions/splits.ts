"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { SplitSchema } from "@/lib/validations/split";

export type ActionState = { error?: string } | undefined;

export async function createSplit(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await verifySession();

  let days: unknown;
  try {
    days = JSON.parse(String(formData.get("days") ?? "[]"));
  } catch {
    return { error: "Could not read split days." };
  }

  const parsed = SplitSchema.safeParse({
    name: formData.get("name"),
    daysPerWeek: formData.get("daysPerWeek"),
    days,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid split." };
  }

  const supabase = await createClient();

  const { data: split, error: splitError } = await supabase
    .from("splits")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      days_per_week: parsed.data.daysPerWeek,
    })
    .select("id")
    .single();

  if (splitError || !split) {
    return { error: splitError?.message ?? "Could not save split." };
  }

  for (const [dayIndex, day] of parsed.data.days.entries()) {
    const { data: splitDay, error: dayError } = await supabase
      .from("split_days")
      .insert({ split_id: split.id, day_index: dayIndex, name: day.name })
      .select("id")
      .single();

    if (dayError || !splitDay) {
      return { error: dayError?.message ?? "Could not save split day." };
    }

    if (day.exerciseIds.length > 0) {
      const rows = day.exerciseIds.map((exerciseId, orderIndex) => ({
        split_day_id: splitDay.id,
        exercise_id: exerciseId,
        order_index: orderIndex,
      }));
      const { error: exError } = await supabase.from("split_day_exercises").insert(rows);
      if (exError) return { error: exError.message };
    }
  }

  revalidatePath("/splits");
  return undefined;
}

export async function deleteSplit(splitId: string) {
  const user = await verifySession();
  const supabase = await createClient();
  await supabase.from("splits").delete().eq("id", splitId).eq("user_id", user.id);
  revalidatePath("/splits");
}

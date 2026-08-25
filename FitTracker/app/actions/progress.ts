"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { BodyMetricSchema } from "@/lib/validations/progress";

export type ActionState = { error?: string } | undefined;

export async function logBodyMetric(_state: ActionState, formData: FormData): Promise<ActionState> {
  const user = await verifySession();

  const parsed = BodyMetricSchema.safeParse({
    date: formData.get("date"),
    weight: formData.get("weight") || undefined,
    chest: formData.get("chest") || undefined,
    waist: formData.get("waist") || undefined,
    arms: formData.get("arms") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid entry." };
  }

  const supabase = await createClient();

  let photoUrl: string | null = null;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const path = `${user.id}/${Date.now()}-${photo.name}`;
    const { error: uploadError } = await supabase.storage
      .from("progress-photos")
      .upload(path, photo);
    if (uploadError) {
      return { error: uploadError.message };
    }
    const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
    photoUrl = data.publicUrl;
  }

  const { weight, chest, waist, arms, date } = parsed.data;
  const measurements: Record<string, number> = {};
  if (chest !== undefined) measurements.chest = chest;
  if (waist !== undefined) measurements.waist = waist;
  if (arms !== undefined) measurements.arms = arms;

  const { error } = await supabase.from("body_metrics").insert({
    user_id: user.id,
    date,
    weight: weight ?? null,
    measurements,
    photo_url: photoUrl,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/progress");
  return undefined;
}

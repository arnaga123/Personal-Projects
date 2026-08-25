import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function getBodyMetrics(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("body_metrics")
    .select("id, date, weight, measurements, photo_url")
    .eq("user_id", userId)
    .order("date", { ascending: true });
  return data ?? [];
}

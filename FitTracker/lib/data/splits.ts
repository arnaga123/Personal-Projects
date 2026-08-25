import "server-only";
import { createClient } from "@/lib/supabase/server";

type SplitRow = {
  id: string;
  name: string;
  days_per_week: number;
  split_days: {
    id: string;
    day_index: number;
    name: string;
    split_day_exercises: {
      order_index: number;
      exercises: { id: string; name: string; muscle_group: string } | null;
    }[];
  }[];
};

export async function getSplits(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("splits")
    .select(
      "id, name, days_per_week, split_days(id, day_index, name, split_day_exercises(order_index, exercises(id, name, muscle_group)))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<SplitRow[]>();
  return data ?? [];
}

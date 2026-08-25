import { LineMetricChart } from "@/components/charts/line-metric-chart";
import type { ExerciseProgressPoint } from "@/lib/data/dashboard";

export function StrengthChart({ data }: { data: ExerciseProgressPoint[] }) {
  return (
    <LineMetricChart
      data={data.map((d) => ({ date: d.date, value: d.weight }))}
      emptyLabel="No sets logged yet."
    />
  );
}

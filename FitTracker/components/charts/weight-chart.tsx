import { LineMetricChart } from "@/components/charts/line-metric-chart";

export function WeightChart({ data }: { data: { date: string; weight: number }[] }) {
  return (
    <LineMetricChart
      data={data.map((d) => ({ date: d.date, value: d.weight }))}
      emptyLabel="Log a body weight entry to see this fill in."
    />
  );
}

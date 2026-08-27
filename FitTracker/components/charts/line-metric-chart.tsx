"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

type Point = { date: string; value: number };

export function LineMetricChart({ data, emptyLabel }: { data: Point[]; emptyLabel: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          stroke="#302820"
          tick={{ fill: "#ab9f8f", fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: "#302820" }}
        />
        <YAxis
          stroke="#302820"
          tick={{ fill: "#ab9f8f", fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<ChartTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#ffb340"
          strokeWidth={2}
          dot={{ r: 3, fill: "#ffb340", strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

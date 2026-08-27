"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VolumePoint } from "@/lib/data/dashboard";
import { ChartTooltip } from "@/components/charts/chart-tooltip";

export function VolumeChart({ data }: { data: VolumePoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        Log a few workouts to see this fill in.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffb340" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#ffb340" stopOpacity={0} />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="volume"
          stroke="#ffb340"
          strokeWidth={2}
          fill="url(#volumeFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

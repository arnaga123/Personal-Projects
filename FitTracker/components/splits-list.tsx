"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteSplit } from "@/app/actions/splits";
import { FilterPill } from "@/components/ui/filter-pill";

type SplitDayExercise = {
  order_index: number;
  exercises: { id: string; name: string; muscle_group: string } | null;
};
type SplitDay = { id: string; day_index: number; name: string; split_day_exercises: SplitDayExercise[] };
type Split = { id: string; name: string; days_per_week: number; split_days: SplitDay[] };

export function SplitsList({ splits }: { splits: Split[] }) {
  const [filter, setFilter] = useState<number | "all">("all");

  const options = useMemo(
    () => Array.from(new Set(splits.map((s) => s.days_per_week))).sort((a, b) => a - b),
    [splits]
  );

  if (splits.length === 0) {
    return <p className="text-sm text-muted">No splits yet — build one below.</p>;
  }

  const filtered = filter === "all" ? splits : splits.filter((s) => s.days_per_week === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <FilterPill active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        {options.map((n) => (
          <FilterPill key={n} active={filter === n} onClick={() => setFilter(n)} label={`${n}-day`} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((split) => (
          <div key={split.id} className="border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-medium">{split.name}</h3>
                <p className="text-xs uppercase tracking-wide text-muted">
                  {split.days_per_week} days / week
                </p>
              </div>
              <form action={deleteSplit.bind(null, split.id)}>
                <button type="submit" className="text-muted hover:text-danger">
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {[...split.split_days]
                .sort((a, b) => a.day_index - b.day_index)
                .map((day) => (
                  <div key={day.id}>
                    <p className="text-sm font-semibold">{day.name}</p>
                    <p className="text-sm text-muted">
                      {[...day.split_day_exercises]
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((e) => e.exercises?.name)
                        .filter(Boolean)
                        .join(", ") || "Rest / no exercises added"}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

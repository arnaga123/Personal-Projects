"use client";

import { useActionState, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { createSplit } from "@/app/actions/splits";
import { Button } from "@/components/ui/button";
import { FilterPill } from "@/components/ui/filter-pill";

type Exercise = { id: string; name: string; muscle_group: string };
type Day = { name: string; exerciseIds: string[] };

function emptyDay(index: number): Day {
  return { name: `Day ${index + 1}`, exerciseIds: [] };
}

export function SplitBuilder({ exercises }: { exercises: Exercise[] }) {
  const [state, action, pending] = useActionState(createSplit, undefined);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [days, setDays] = useState<Day[]>(Array.from({ length: 3 }, (_, i) => emptyDay(i)));
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");

  const muscleGroups = useMemo(
    () => Array.from(new Set(exercises.map((e) => e.muscle_group))).sort(),
    [exercises]
  );

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      const matchesSearch = !query || ex.name.toLowerCase().includes(query);
      const matchesMuscle = muscleFilter === "all" || ex.muscle_group === muscleFilter;
      return matchesSearch && matchesMuscle;
    });
  }, [exercises, search, muscleFilter]);

  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e.id, e])), [exercises]);

  const EXERCISE_LIST_CAP = 30;
  const visibleExercises = filteredExercises.slice(0, EXERCISE_LIST_CAP);
  const hiddenCount = filteredExercises.length - visibleExercises.length;

  function changeDaysPerWeek(next: number) {
    setDaysPerWeek(next);
    setDays((prev) => Array.from({ length: next }, (_, i) => prev[i] ?? emptyDay(i)));
  }

  function toggleExercise(dayIndex: number, exerciseId: string) {
    setDays((prev) =>
      prev.map((day, i) => {
        if (i !== dayIndex) return day;
        const has = day.exerciseIds.includes(exerciseId);
        return {
          ...day,
          exerciseIds: has
            ? day.exerciseIds.filter((id) => id !== exerciseId)
            : [...day.exerciseIds, exerciseId],
        };
      })
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="daysPerWeek" value={daysPerWeek} />
      <input type="hidden" name="days" value={JSON.stringify(days)} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Split name</span>
          <input
            type="text"
            name="name"
            required
            placeholder="Push Pull Legs"
            className="rounded-xl border border-transparent bg-surface px-4 py-2.5 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none focus:bg-background focus:ring-4 focus:ring-surface"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Days per week
          </span>
          <select
            value={daysPerWeek}
            onChange={(e) => changeDaysPerWeek(Number(e.target.value))}
            className="rounded-xl border border-transparent bg-surface px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:bg-background focus:ring-4 focus:ring-surface"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n} day{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-3 bg-surface p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Filter exercises for every day below
        </p>
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            aria-label="Search exercises"
            className="w-full rounded-xl border border-transparent bg-background py-2.5 pl-9 pr-3 text-sm placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-4 focus:ring-surface"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={muscleFilter === "all"} onClick={() => setMuscleFilter("all")} label="All" />
          {muscleGroups.map((group) => (
            <FilterPill
              key={group}
              active={muscleFilter === group}
              onClick={() => setMuscleFilter(group)}
              label={group}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day, dayIndex) => (
          <div key={dayIndex} className="bg-surface p-4">
            <input
              type="text"
              value={day.name}
              onChange={(e) =>
                setDays((prev) => prev.map((d, i) => (i === dayIndex ? { ...d, name: e.target.value } : d)))
              }
              aria-label={`Day ${dayIndex + 1} name`}
              className="mb-3 border-b border-border bg-transparent pb-2 text-sm font-medium focus:border-accent focus:outline-none"
            />

            {day.exerciseIds.length > 0 && (
              <p className="mb-3 text-xs text-muted">
                Selected:{" "}
                <span className="text-foreground">
                  {day.exerciseIds
                    .map((id) => exerciseById.get(id)?.name)
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </p>
            )}

            {filteredExercises.length === 0 ? (
              <p className="text-sm text-muted">No exercises match your filter.</p>
            ) : (
              <>
                <div className="grid max-h-48 grid-cols-2 gap-x-4 gap-y-1.5 overflow-y-auto sm:grid-cols-3">
                  {visibleExercises.map((ex) => (
                    <label key={ex.id} className="flex items-center gap-2 text-sm text-muted">
                      <input
                        type="checkbox"
                        checked={day.exerciseIds.includes(ex.id)}
                        onChange={() => toggleExercise(dayIndex, ex.id)}
                        className="accent-[#8a5738]"
                      />
                      <span className={day.exerciseIds.includes(ex.id) ? "text-foreground" : undefined}>
                        {ex.name}
                      </span>
                    </label>
                  ))}
                </div>
                {hiddenCount > 0 && (
                  <p className="mt-2 text-xs text-muted">
                    Showing {EXERCISE_LIST_CAP} of {filteredExercises.length} — refine your search or pick a
                    muscle group to see the rest.
                  </p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {state?.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save split"}
      </Button>
    </form>
  );
}

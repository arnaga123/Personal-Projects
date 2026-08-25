import { verifySession } from "@/lib/dal";
import { getDashboardData } from "@/lib/data/dashboard";
import { StatTile } from "@/components/ui/stat-tile";
import { VolumeChart } from "@/components/charts/volume-chart";
import { StrengthChart } from "@/components/charts/strength-chart";

export default async function DashboardPage() {
  const user = await verifySession();
  const { totalWorkouts, volumeSeries, strengthSeries, topExercise, streak } =
    await getDashboardData(user.id);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Dashboard</p>
        <h1 className="mt-1 font-display text-3xl font-medium">Your numbers</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Current streak" value={streak} unit="days" accent />
        <StatTile label="Workouts logged" value={totalWorkouts} />
        <StatTile label="Top exercise" value={topExercise ?? "—"} />
        <StatTile label="Last session volume" value={Math.round(volumeSeries.at(-1)?.volume ?? 0)} unit="lb" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-medium">Volume over time</h2>
          <p className="mt-1 text-sm text-muted">Total reps × weight, per session.</p>
          <div className="mt-6 h-64">
            <VolumeChart data={volumeSeries} />
          </div>
        </div>
        <div className="border border-border bg-surface p-6">
          <h2 className="font-display text-lg font-medium">
            {topExercise ? `${topExercise} — top set` : "Strength over time"}
          </h2>
          <p className="mt-1 text-sm text-muted">Heaviest weight logged per session.</p>
          <div className="mt-6 h-64">
            <StrengthChart data={strengthSeries} />
          </div>
        </div>
      </div>

      {totalWorkouts === 0 && (
        <div className="border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">
            No workouts logged yet. Head to{" "}
            <a href="/log" className="text-accent underline underline-offset-4">
              Log
            </a>{" "}
            to add your first session.
          </p>
        </div>
      )}
    </div>
  );
}

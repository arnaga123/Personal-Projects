import { verifySession } from "@/lib/dal";
import { getBodyMetrics } from "@/lib/data/progress";
import { WeightChart } from "@/components/charts/weight-chart";
import { BodyMetricForm } from "@/components/body-metric-form";

export default async function ProgressPage() {
  const user = await verifySession();
  const metrics = await getBodyMetrics(user.id);
  const weightSeries = metrics
    .filter((m) => m.weight != null)
    .map((m) => ({ date: m.date, weight: m.weight as number }));
  const photos = [...metrics].reverse().filter((m) => m.photo_url);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Progress</p>
        <h1 className="mt-1 font-display text-3xl font-medium">Body over time</h1>
      </div>

      <div className="border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-medium">Body weight</h2>
        <div className="mt-6 h-64">
          <WeightChart data={weightSeries} />
        </div>
      </div>

      {photos.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-medium">Photos</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={m.id}
                src={m.photo_url!}
                alt={`Progress photo from ${m.date}`}
                className="aspect-square w-full object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border pt-8">
        <h2 className="font-display text-xl font-medium">Log an entry</h2>
        <div className="mt-6">
          <BodyMetricForm />
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="border border-border bg-surface px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-4xl font-medium leading-none tabular-nums",
          accent ? "text-accent" : "text-foreground"
        )}
      >
        {value}
        {unit && <span className="ml-1.5 text-lg text-muted">{unit}</span>}
      </p>
    </div>
  );
}

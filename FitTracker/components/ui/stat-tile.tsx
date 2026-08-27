import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatTile({
  label,
  value,
  unit,
  accent = false,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  accent?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-surface px-5 py-4 transition duration-200",
        "hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-black/30"
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-accent/25 blur-2xl transition-opacity duration-200 group-hover:opacity-80" />
      )}
      <div className="relative flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className={accent ? "text-accent" : "text-muted"}
          />
        )}
      </div>
      <p
        className={cn(
          "relative mt-2 line-clamp-2 font-display font-medium leading-tight tabular-nums",
          // A long string value (an exercise name) at the same size as a
          // short number looked cramped and wrapped across three lines —
          // numbers stay big and bold, text falls back to a size that fits.
          // line-clamp-2 caps it there even if a name is longer still.
          typeof value === "string" && value.length > 10 ? "text-xl" : "text-4xl leading-none",
          accent ? "text-accent" : "text-foreground"
        )}
      >
        {value}
        {unit && <span className="ml-1.5 text-lg text-muted">{unit}</span>}
      </p>
    </div>
  );
}

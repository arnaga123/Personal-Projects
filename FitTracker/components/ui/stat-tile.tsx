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
    // Nike cards: zero radius, zero shadow, sit flat on soft-cloud. The
    // "accent" streak tile gets ink-on-white inversion instead of a glow —
    // that's how the system signals emphasis without a second color.
    <div className={cn("flex flex-col gap-2 px-5 py-4", accent ? "bg-accent" : "bg-surface")}>
      <div className="flex items-start justify-between gap-2">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wide",
            accent ? "text-accent-foreground/70" : "text-muted"
          )}
        >
          {label}
        </p>
        {Icon && (
          <Icon
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className={accent ? "text-accent-foreground" : "text-muted"}
          />
        )}
      </div>
      <p
        className={cn(
          "line-clamp-2 font-display font-medium leading-tight tabular-nums",
          // A long string value (an exercise name) at the same size as a
          // short number looked cramped and wrapped across three lines —
          // numbers stay big and bold, text falls back to a size that fits.
          typeof value === "string" && value.length > 10 ? "text-xl" : "text-4xl leading-none",
          accent ? "text-accent-foreground" : "text-foreground"
        )}
      >
        {value}
        {unit && (
          <span className={cn("ml-1.5 text-lg", accent ? "text-accent-foreground/70" : "text-muted")}>
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

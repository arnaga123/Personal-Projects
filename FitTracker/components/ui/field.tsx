import { type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      <input
        className={cn(
          "rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted/60 transition-colors duration-200 focus-visible:border-accent focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,179,64,0.15)]",
          error && "border-danger",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

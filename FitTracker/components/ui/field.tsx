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
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      <input
        className={cn(
          // Nike search-pill / search-pill-focused: soft-cloud fill by
          // default, canvas fill + solid ink border + soft-cloud halo when
          // focused — the system's only "focus ring" effect.
          "rounded-xl border border-transparent bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted/70 transition-colors duration-150 focus-visible:border-accent focus-visible:bg-background focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-surface",
          error && "border-danger",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

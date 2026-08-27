export function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide capitalize transition duration-200 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "bg-accent text-accent-foreground shadow-[0_0_12px_-2px_rgba(255,179,64,0.5)]"
          : "border border-border text-muted hover:-translate-y-0.5 hover:border-accent/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

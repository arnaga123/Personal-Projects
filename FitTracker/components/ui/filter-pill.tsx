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
      className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide capitalize transition-colors ${
        active ? "bg-accent text-accent-foreground" : "border border-border text-muted hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

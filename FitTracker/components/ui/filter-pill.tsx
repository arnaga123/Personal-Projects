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
      className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? "bg-accent text-accent-foreground"
          : "border border-border text-foreground hover:bg-surface"
      }`}
    >
      {label}
    </button>
  );
}

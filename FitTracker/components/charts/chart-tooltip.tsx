type TooltipProps = {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
};

export function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="border border-border bg-background px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-muted">
          {Math.round(entry.value).toLocaleString()}
        </p>
      ))}
    </div>
  );
}

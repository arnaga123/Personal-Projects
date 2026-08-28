export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <span className="mb-10 font-display text-lg font-semibold tracking-tight">
        FIT<span className="text-accent">TRACKER</span>
      </span>
      {/* bg-background (not bg-surface), matching the auth layout, so any
          Field-based input here stays visible against the card. */}
      <div className="w-full max-w-md border border-border bg-background p-8">{children}</div>
    </div>
  );
}

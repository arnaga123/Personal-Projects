export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <span className="mb-10 font-display text-lg font-semibold tracking-tight">
        FIT<span className="text-accent">TRACKER</span>
      </span>
      <div className="w-full max-w-md border border-border bg-surface p-8">{children}</div>
    </div>
  );
}

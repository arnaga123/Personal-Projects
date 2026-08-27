export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <span className="mb-10 font-display text-lg font-semibold tracking-tight">
        FIT<span className="text-accent drop-shadow-[0_0_10px_rgba(255,179,64,0.5)]">TRACKER</span>
      </span>
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-2xl shadow-black/40">
        {children}
      </div>
    </div>
  );
}

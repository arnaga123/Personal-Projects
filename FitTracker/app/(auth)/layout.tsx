import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-10 font-display text-lg font-semibold tracking-tight">
        FIT<span className="text-accent">TRACKER</span>
      </Link>
      {/* bg-background (not bg-surface) so Field's default surface-filled
          inputs stay visible against the card instead of blending into it. */}
      <div className="w-full max-w-sm border border-border bg-background p-8">{children}</div>
    </div>
  );
}

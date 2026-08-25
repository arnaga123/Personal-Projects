import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="mb-10 font-display text-lg font-semibold tracking-tight">
        FIT<span className="text-accent">TRACKER</span>
      </Link>
      <div className="w-full max-w-sm border border-border bg-surface p-8">{children}</div>
    </div>
  );
}

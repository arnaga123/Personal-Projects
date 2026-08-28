import Link from "next/link";
import { ArrowUpRight, CalendarRange, Flame, LineChart, ListChecks } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const FEATURES = [
  {
    icon: LineChart,
    title: "Progress graphs",
    description:
      "Strength, volume, and body weight charted over time — the #1 thing our survey respondents asked for.",
  },
  {
    icon: ListChecks,
    title: "Workout logger",
    description: "Log sets, reps, and weight in seconds. Every session becomes data on your dashboard.",
  },
  {
    icon: CalendarRange,
    title: "Splits that fit your week",
    description: "Pick or build a 2, 3, or 4-day split that actually matches your schedule.",
  },
  {
    icon: Flame,
    title: "Streaks",
    description: "Consistency, not motivation, is the real blocker. FitTracker keeps score so you don't have to.",
  },
];

const STATS = [
  { value: "61%", label: "of people we surveyed already train regularly" },
  { value: "#1", label: "request: progress graphs that show real growth" },
  { value: "39%", label: "say motivation, not gym access, keeps them out" },
  { value: "2–4", label: "day splits, built around your actual schedule" },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-10">
        <span className="font-display text-lg font-semibold tracking-tight">
          FIT<span className="text-accent">TRACKER</span>
        </span>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground">
            Log in
          </Link>
          <Link href="/signup" className={buttonVariants("primary", "text-xs")}>
            Sign up <ArrowUpRight size={14} strokeWidth={2} />
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:px-10 md:pt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Built for the gym, not the boardroom
        </p>
        <h1 className="mt-4 max-w-3xl text-balance font-hero text-6xl uppercase leading-[0.9] tracking-tight md:text-8xl">
          Log it. See it grow. Don&apos;t break the streak.
        </h1>
        <p className="mt-6 max-w-[60ch] text-base text-muted md:text-lg">
          FitTracker turns every session into a graph, every split into a plan you&apos;ll actually
          follow, and every day you show up into a streak worth protecting.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/signup" className={buttonVariants("primary")}>
            Start tracking <ArrowUpRight size={16} strokeWidth={2} />
          </Link>
          <Link href="/login" className={buttonVariants("secondary")}>
            I have an account
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="border-border px-6 py-8 md:px-8 [&:not(:last-child)]:border-r">
              <p className="font-display text-3xl font-medium text-accent">{stat.value}</p>
              <p className="mt-2 text-sm text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-10">
        <h2 className="font-display text-2xl font-medium md:text-3xl">
          Built from what 41 gym-goers told us they actually need
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-surface p-6">
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" className="text-accent" />
              <h3 className="mt-4 font-display text-lg font-medium">{title}</h3>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center md:px-10">
          <h2 className="font-display text-2xl font-medium md:text-3xl">
            Your first logged set is a minute away.
          </h2>
          <Link href="/signup" className={buttonVariants("primary")}>
            Start tracking <ArrowUpRight size={16} strokeWidth={2} />
          </Link>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted md:px-10">
        FitTracker
      </footer>
    </div>
  );
}

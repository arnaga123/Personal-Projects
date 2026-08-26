"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const TOUR_SEEN_KEY = "fittracker-tour-seen";

const STEPS = [
  { key: "dashboard", title: "Dashboard", description: "Your home base — see today's stats and recent activity at a glance." },
  { key: "log", title: "Log", description: "Record today's sets, reps, and weight as you train." },
  { key: "splits", title: "Splits", description: "Build and manage the weekly training split you follow." },
  {
    key: "exercises",
    title: "Exercises",
    description: "Browse the exercise library — each one has a 3D muscle diagram showing exactly what it targets.",
  },
  { key: "progress", title: "Progress", description: "Track your strength and volume over time." },
  { key: "settings", title: "Settings", description: "Update your goal, experience level, and preferred training days." },
] as const;

function findVisibleTarget(key: string): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`);
  for (const el of candidates) {
    // The desktop sidebar and mobile nav both render every item, but only
    // one is visible at a given viewport width (the other is display:none),
    // so pick whichever one actually has layout size.
    if (el.offsetWidth > 0 && el.offsetHeight > 0) return el;
  }
  return null;
}

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so "should the tour run" can
    // only be known after mount — there's no way to fold this into the
    // initial render without a client/server hydration mismatch.
    if (window.localStorage.getItem(TOUR_SEEN_KEY)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const update = () => {
      const target = findVisibleTarget(STEPS[step].key);
      setRect(target?.getBoundingClientRect() ?? null);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active, step]);

  function finish() {
    window.localStorage.setItem(TOUR_SEEN_KEY, "1");
    setActive(false);
  }

  if (!active || !rect) return null;

  const isMobileNav = rect.top < 80 && rect.height < 60;
  const tooltipStyle: React.CSSProperties = isMobileNav
    ? { top: rect.bottom + 12, left: Math.max(12, Math.min(rect.left, window.innerWidth - 300)) }
    : { top: Math.max(12, rect.top), left: rect.right + 16 };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-label="Site tour">
      <div
        className="fixed rounded-sm ring-2 ring-accent transition-all duration-200"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)",
        }}
      />
      <div
        className="fixed w-72 max-w-[calc(100vw-24px)] border border-border bg-surface p-5 shadow-xl"
        style={tooltipStyle}
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {step + 1} of {STEPS.length}
        </p>
        <h2 className="mt-1 font-display text-lg font-medium">{STEPS[step].title}</h2>
        <p className="mt-1.5 text-sm text-muted">{STEPS[step].description}</p>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={finish} className="text-xs text-muted underline underline-offset-4 hover:text-foreground">
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted hover:text-foreground"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (step + 1 < STEPS.length ? setStep((s) => s + 1) : finish())}
              className={cn(
                "bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent-foreground hover:bg-accent/90"
              )}
            >
              {step + 1 < STEPS.length ? "Next" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

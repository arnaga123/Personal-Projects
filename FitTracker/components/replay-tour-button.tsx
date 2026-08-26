"use client";

import { TOUR_SEEN_KEY } from "@/components/product-tour";

export function ReplayTourButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.localStorage.removeItem(TOUR_SEEN_KEY);
        // A hard navigation, not router.push: ProductTour lives in the
        // shared (app) layout, which Next.js keeps mounted across a
        // client-side route change within the same layout — its
        // mount-time localStorage check wouldn't re-run otherwise.
        window.location.href = "/dashboard";
      }}
      className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
    >
      Replay the site tour
    </button>
  );
}

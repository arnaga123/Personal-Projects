"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/nav";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-border bg-surface px-3 py-2 md:hidden">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            data-tour={href.slice(1)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition duration-200",
              active
                ? "bg-accent/10 text-accent shadow-[0_0_10px_-4px_var(--accent)]"
                : "text-muted hover:bg-surface-hover hover:text-foreground"
            )}
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

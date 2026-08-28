"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function NavLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      data-tour={href.slice(1)}
      className={cn(
        // Nike's primary-nav marks the active section with a 2px ink
        // underline and no background fill — rotated to a left border for
        // our vertical sidebar since there's no direct "underline" axis.
        "relative flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150",
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted hover:bg-surface hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

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
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200",
        active
          ? "bg-accent/10 text-foreground"
          : "text-muted hover:translate-x-0.5 hover:bg-surface-hover hover:text-foreground"
      )}
    >
      {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />}
      {icon}
      {label}
    </Link>
  );
}

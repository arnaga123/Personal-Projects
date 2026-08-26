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
        "flex items-center gap-3 border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-accent bg-background text-foreground"
          : "border-transparent text-muted hover:bg-background hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

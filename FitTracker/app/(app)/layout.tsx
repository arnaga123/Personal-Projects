import Link from "next/link";
import { LogOut } from "lucide-react";
import { verifySession } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { NavLink } from "@/components/nav-link";
import { MobileNav } from "@/components/mobile-nav";
import { ProductTour } from "@/components/product-tour";
import { NAV_ITEMS } from "@/lib/nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await verifySession();
  const name = (user.user_metadata?.name as string | undefined) ?? user.email ?? "Athlete";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="border-b border-border px-6 py-6">
          <Link href="/dashboard" className="font-display text-xl font-semibold tracking-tight">
            FIT<span className="text-accent">TRACKER</span>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <NavLink key={href} href={href} label={label} icon={<Icon size={18} strokeWidth={1.75} />} />
          ))}
        </nav>
        <div className="border-t border-border px-3 py-4">
          <p className="truncate px-3 text-xs text-muted">{name}</p>
          <form action={logout}>
            <button className="mt-2 flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:text-danger">
              <LogOut size={18} strokeWidth={1.75} />
              Log out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1">
        <MobileNav />
        <main className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-10">{children}</main>
      </div>
      <ProductTour />
    </div>
  );
}

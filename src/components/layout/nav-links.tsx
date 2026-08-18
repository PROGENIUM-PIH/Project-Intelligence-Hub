"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("pih-nav-item group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "pih-nav-active bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
            <span className="pih-nav-icon flex h-7 w-7 items-center justify-center rounded-lg"><Icon className="h-4 w-4 shrink-0" /></span>
            <span>{item.label}</span>
            <span className="pih-nav-dot ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary opacity-0" />
          </Link>
        );
      })}
    </nav>
  );
}

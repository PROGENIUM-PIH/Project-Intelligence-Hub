"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

const hiddenHrefs = new Set(["/settings", "/meetings", "/tasks", "/risks"]);

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const hiddenActive = navItems.some((item) => hiddenHrefs.has(item.href) && (pathname === item.href || pathname?.startsWith(`${item.href}/`)));
  const [hiddenOpen, setHiddenOpen] = useState(hiddenActive);
  const primaryItems = navItems.filter((item) => !hiddenHrefs.has(item.href));
  const hiddenItems = navItems.filter((item) => hiddenHrefs.has(item.href));

  const renderItem = (item: (typeof navItems)[number], nested = false) => {
    const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
    const Icon = item.icon;
    return (
      <Link key={item.href} href={item.href} onClick={onNavigate} className={cn("pih-nav-item group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", nested && "ml-3", active ? "pih-nav-active bg-sidebar-primary text-sidebar-primary-foreground shadow-sm" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
        <span className="pih-nav-icon flex h-7 w-7 items-center justify-center rounded-lg"><Icon className="h-4 w-4 shrink-0" /></span>
        <span>{item.label}</span>
        <span className="pih-nav-dot ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary opacity-0" />
      </Link>
    );
  };

  return (
    <nav className="flex-1 space-y-1 px-3 py-4">
      {primaryItems.map((item) => renderItem(item))}

      <div className="pt-2">
        <button type="button" onClick={() => setHiddenOpen((open) => !open)} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" aria-expanded={hiddenOpen}>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg">
            {hiddenOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
          <span>Hide</span>
        </button>
        {hiddenOpen && <div className="mt-1 space-y-1">{hiddenItems.map((item) => renderItem(item, true))}</div>}
      </div>
    </nav>
  );
}

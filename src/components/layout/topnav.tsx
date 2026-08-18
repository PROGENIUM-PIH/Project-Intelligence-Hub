"use client";

import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { SearchBar } from "@/components/shared/search-bar";
import { NavLinks } from "./nav-links";
import { ThemeSwitcher } from "./theme-switcher";
import { useState } from "react";

export function TopNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="pih-topnav sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-8">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Open navigation</span></Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center px-6"><span className="text-base font-semibold tracking-tight">Project <span className="text-sidebar-primary">Intelligence</span> Hub</span></div>
          <NavLinks onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <Image src="/branding/skoda-logo.jpg" alt="Škoda" width={100} height={11} priority className="pih-brand-logo hidden shrink-0 sm:block" />
      <div className="hidden h-6 w-px bg-border sm:block" />
      <SearchBar placeholder="Search markets, initiatives, tasks..." className="max-w-md flex-1" />
      <div className="ml-auto flex items-center gap-3">
        <ThemeSwitcher />
        <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-xs text-primary-foreground">LB</AvatarFallback></Avatar>
      </div>
    </header>
  );
}

import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center px-6">
        <span className="text-base font-semibold tracking-tight">
          Project <span className="text-sidebar-primary">Intelligence</span> Hub
        </span>
      </div>
      <NavLinks />
      <div className="border-t border-sidebar-border px-6 py-4 text-xs text-sidebar-foreground/50">
        Global Sales Transformation Program
      </div>
    </aside>
  );
}

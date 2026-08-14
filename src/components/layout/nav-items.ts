import {
  LayoutDashboard,
  Globe,
  Target,
  CalendarDays,
  ListChecks,
  ShieldAlert,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/markets", label: "Markets", icon: Globe },
  { href: "/initiatives", label: "Initiatives", icon: Target },
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/risks", label: "Risks", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
];

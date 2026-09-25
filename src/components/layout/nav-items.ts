import {
  LayoutDashboard,
  Globe,
  Target,
  CalendarDays,
  ListChecks,
  ShieldAlert,
  Settings,
  FileSpreadsheet,
  Inbox,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/updates", label: "Data Intake", icon: Inbox },
  { href: "/markets", label: "Market Steering", icon: Globe },
  { href: "/initiatives", label: "Initiatives", icon: Target },
  { href: "/tasks", label: "Task Tracker", icon: ListChecks },
  { href: "/reports", label: "Reports", icon: FileSpreadsheet },
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/risks", label: "Risks", icon: ShieldAlert },
  { href: "/settings", label: "Settings", icon: Settings },
];

import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/status";

const toneClasses: Record<Tone, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-secondary text-secondary-foreground border-border",
};

const dotClasses: Record<Tone, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  critical: "bg-red-500",
  info: "bg-blue-500",
  neutral: "bg-muted-foreground",
};

type StatusBadgeProps = {
  label: string;
  tone: Tone;
  className?: string;
};

export function StatusBadge({ label, tone, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClasses[tone])} />
      {label}
    </span>
  );
}

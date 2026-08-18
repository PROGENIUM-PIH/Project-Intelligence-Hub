import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type KpiCardProps = { label: string; value: string | number; icon: LucideIcon; hint?: string; tone?: "default" | "warning" | "critical"; featured?: boolean; };

export function KpiCard({ label, value, icon: Icon, hint, tone = "default", featured = false }: KpiCardProps) {
  return (
    <>
      <Card className={cn("pih-interactive-card pih-kpi-card border-border/80", featured && "pih-featured-card")}>
        <CardContent className="flex items-start justify-between p-6">
          <div>
            <p className="pih-eyebrow text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          <div className={cn("pih-icon-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", tone === "critical" ? "bg-red-50 text-red-600" : tone === "warning" ? "bg-amber-50 text-amber-600" : "bg-accent text-primary")}>
            <Icon className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
      <style>{`
        html:not([data-pih-theme="new-web"]) .pih-kpi-card {
          border-width: 2px;
          transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease, background 180ms ease, color 180ms ease !important;
        }
        html:not([data-pih-theme="new-web"]) .pih-kpi-card:hover {
          transform: translateY(-4px) !important;
          border-color: #10B981 !important;
          background: #10B981 !important;
          color: #0B2D24 !important;
          box-shadow: 0 18px 42px rgba(14,58,47,.18), 0 0 0 2px rgba(16,185,129,.22), 0 0 32px rgba(16,185,129,.18) !important;
        }
        html:not([data-pih-theme="new-web"]) .pih-kpi-card:hover .text-foreground,
        html:not([data-pih-theme="new-web"]) .pih-kpi-card:hover .text-muted-foreground {
          color: #0B2D24 !important;
        }
        html:not([data-pih-theme="new-web"]) .pih-kpi-card:hover .pih-icon-tile {
          transform: scale(1.08) rotate(-2deg) !important;
          background: rgba(11,45,36,.14) !important;
          color: #0B2D24 !important;
        }
      `}</style>
    </>
  );
}

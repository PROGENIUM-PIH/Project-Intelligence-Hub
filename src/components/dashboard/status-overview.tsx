import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { healthTone } from "@/lib/status";

type Entity = { id: string; name: string; status: string; code?: string; };

const marketFlags: Record<string, string> = {
  france: "🇫🇷",
  germany: "🇩🇪",
  austria: "🇦🇹",
  poland: "🇵🇱",
  norway: "🇳🇴",
  "czech republic": "🇨🇿",
  czechia: "🇨🇿",
  netherlands: "🇳🇱",
  uk: "🇬🇧",
  "united kingdom": "🇬🇧",
};

export function StatusOverview({ title, href, items }: { title: string; href: string; items: Entity[] }) {
  const isInitiatives = title === "Initiatives";
  const isMarkets = title === "Markets";
  return (
    <Card className="pih-module-card pih-status-overview flex h-[430px] flex-col">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={href} className="pih-inline-action flex items-center gap-1 text-xs font-medium text-primary">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
      </CardHeader>
      <CardContent className={`min-h-0 flex-1 space-y-1 pr-3 ${isInitiatives ? "pih-overview-scroll overflow-y-auto" : "overflow-hidden"}`}>
        {items.map((item) => {
          const { label, tone } = healthTone(item.status);
          const flag = isMarkets ? marketFlags[item.name.trim().toLowerCase()] : undefined;
          return (
            <Link href={`${href}/${item.id}`} key={item.id} className="pih-data-row group flex items-center justify-between gap-4 rounded-xl px-3 py-2">
              <span className="flex min-w-0 items-center gap-2.5">
                {flag ? <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center text-[20px] leading-none">{flag}</span> : null}
                <span className="truncate text-sm text-foreground">{item.code ? <span className="mr-1.5 text-muted-foreground">{item.code}</span> : null}{item.name}</span>
              </span>
              <div className="flex items-center gap-2"><StatusBadge label={label} tone={tone} /><ArrowRight className="pih-row-arrow h-3.5 w-3.5 text-muted-foreground" /></div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

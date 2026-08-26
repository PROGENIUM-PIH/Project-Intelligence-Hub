import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { healthTone } from "@/lib/status";

type Entity = { id: string; name: string; status: string; code?: string; };

const marketFlagFiles: Record<string, string> = {
  france: "/flags/france.svg",
  germany: "/flags/germany.svg",
  austria: "/flags/austria.svg",
  poland: "/flags/poland.svg",
  norway: "/flags/norway.svg",
  "czech republic": "/flags/czech-republic.svg",
  czechia: "/flags/czech-republic.svg",
  netherlands: "/flags/netherlands.svg",
  uk: "/flags/uk.svg",
  "united kingdom": "/flags/uk.svg",
};

export function StatusOverview({ title, href, items }: { title: string; href: string; items: Entity[] }) {
  const isMarkets = title === "Markets";
  return (
    <Card className="pih-module-card pih-status-overview flex h-[430px] flex-col">
      <CardHeader className="flex shrink-0 flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={href} className="pih-inline-action flex items-center gap-1 text-xs font-medium text-primary">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
      </CardHeader>
      <CardContent className="pih-overview-scroll min-h-0 flex-1 space-y-1 overflow-y-scroll pr-3 [scrollbar-gutter:stable]">
        {items.map((item) => {
          const { label, tone } = healthTone(item.status);
          const flagSrc = isMarkets ? marketFlagFiles[item.name.trim().toLowerCase()] : undefined;
          return (
            <Link href={`${href}/${item.id}`} key={item.id} className="pih-data-row group flex items-center justify-between gap-4 rounded-xl px-3 py-2">
              <span className="flex min-w-0 items-center gap-2.5">
                {flagSrc ? (
                  <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-border bg-secondary">
                    <Image src={flagSrc} alt={`${item.name} flag`} fill unoptimized sizes="28px" className="object-cover" />
                  </span>
                ) : null}
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

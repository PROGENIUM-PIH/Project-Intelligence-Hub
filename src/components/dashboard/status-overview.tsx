import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { healthTone } from "@/lib/status";

type Entity = { id: string; name: string; status: string; code?: string; };

export function StatusOverview({ title, href, items }: { title: string; href: string; items: Entity[] }) {
  return (
    <Card className="pih-module-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={href} className="pih-inline-action flex items-center gap-1 text-xs font-medium text-primary">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.map((item) => {
          const { label, tone } = healthTone(item.status);
          return (
            <Link href={`${href}/${item.id}`} key={item.id} className="pih-data-row group flex items-center justify-between gap-4 rounded-xl px-3 py-2.5">
              <span className="truncate text-sm text-foreground">{item.code ? <span className="mr-1.5 text-muted-foreground">{item.code}</span> : null}{item.name}</span>
              <div className="flex items-center gap-2"><StatusBadge label={label} tone={tone} /><ArrowRight className="pih-row-arrow h-3.5 w-3.5 text-muted-foreground" /></div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

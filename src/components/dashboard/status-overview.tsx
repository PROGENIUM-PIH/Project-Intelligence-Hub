import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { healthTone } from "@/lib/status";

type Entity = {
  id: string;
  name: string;
  status: string;
  code?: string;
};

export function StatusOverview({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: Entity[];
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={href} className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => {
          const { label, tone } = healthTone(item.status);
          return (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <span className="truncate text-sm text-foreground">
                {item.code ? (
                  <span className="mr-1.5 text-muted-foreground">{item.code}</span>
                ) : null}
                {item.name}
              </span>
              <StatusBadge label={label} tone={tone} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

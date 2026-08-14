import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ActivityItem = {
  id: string;
  description: string;
  actor: string;
  createdAt: Date;
};

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Latest Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-5">
          {items.map((item, idx) => (
            <li key={item.id} className="relative flex gap-3 pl-4">
              <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-primary" />
              {idx !== items.length - 1 ? (
                <span className="absolute -bottom-5 left-[3px] top-4 w-px bg-border" />
              ) : null}
              <div className="min-w-0">
                <p className="text-sm text-foreground">{item.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.actor} · {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

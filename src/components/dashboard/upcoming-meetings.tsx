import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { meetingTypeLabel } from "@/lib/status";
import { CalendarDays } from "lucide-react";

type MeetingItem = {
  id: string;
  title: string;
  type: string;
  date: Date;
  scopeLabel: string;
};

export function UpcomingMeetings({ items }: { items: MeetingItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Upcoming Meetings</CardTitle>
        <Link href="/meetings" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No upcoming meetings scheduled.</p>
        ) : null}
        {items.map((m) => (
          <div key={m.id} className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{m.title}</p>
              <p className="text-xs text-muted-foreground">
                {format(m.date, "EEE, MMM d")} · {meetingTypeLabel(m.type)} · {m.scopeLabel}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

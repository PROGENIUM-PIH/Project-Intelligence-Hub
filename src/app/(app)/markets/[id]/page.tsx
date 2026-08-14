import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { healthTone, meetingTypeLabel } from "@/lib/status";

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const market = await prisma.market.findUnique({
    where: { id },
    include: {
      initiatives: { include: { initiative: true } },
      meetings: { orderBy: { date: "desc" } },
    },
  });

  if (!market) notFound();

  const { label, tone } = healthTone(market.status);

  return (
    <div>
      <PageHeader
        title={market.name}
        description={`${market.region} · Market Lead: ${market.lead}`}
        actions={<StatusBadge label={label} tone={tone} />}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked Initiatives</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {market.initiatives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No initiatives linked yet.</p>
            ) : null}
            {market.initiatives.map((mi) => {
              const t = healthTone(mi.localStatus);
              return (
                <Link
                  key={mi.id}
                  href={`/initiatives/${mi.initiativeId}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {mi.initiative.code} · {mi.initiative.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Local lead: {mi.localLead}
                    </p>
                  </div>
                  <StatusBadge label={t.label} tone={t.tone} />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Meetings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {market.meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No meetings recorded yet.</p>
            ) : null}
            {market.meetings.map((m) => (
              <div key={m.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground">{m.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(m.date, "EEE, MMM d yyyy")} · {meetingTypeLabel(m.type)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

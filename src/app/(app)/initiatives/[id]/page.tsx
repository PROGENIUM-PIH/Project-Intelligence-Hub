import { notFound } from "next/navigation";
import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  healthTone,
  taskStatusTone,
  riskSeverityTone,
  meetingTypeLabel,
} from "@/lib/status";

export default async function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initiative = await prisma.initiative.findUnique({
    where: { id },
    include: {
      markets: { include: { market: true } },
      tasks: { orderBy: { dueDate: "asc" } },
      risks: { orderBy: { identifiedDate: "desc" } },
      meetings: { orderBy: { date: "desc" } },
    },
  });

  if (!initiative) notFound();

  const { label, tone } = healthTone(initiative.status);

  return (
    <div>
      <PageHeader
        title={`${initiative.code} · ${initiative.name}`}
        description={`Owner: ${initiative.owner} · Target: ${format(initiative.targetDate, "MMM yyyy")}`}
        actions={<StatusBadge label={label} tone={tone} />}
      />

      <Card className="mb-6">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">{initiative.description}</p>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Overall Progress</span>
              <span className="font-medium text-foreground">{initiative.progress}%</span>
            </div>
            <Progress value={initiative.progress} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="markets">
        <TabsList>
          <TabsTrigger value="markets">Markets ({initiative.markets.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({initiative.tasks.length})</TabsTrigger>
          <TabsTrigger value="risks">Risks ({initiative.risks.length})</TabsTrigger>
          <TabsTrigger value="meetings">Meetings ({initiative.meetings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="markets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Participating Markets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {initiative.markets.map((mi) => {
                const t = healthTone(mi.localStatus);
                return (
                  <div
                    key={mi.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {mi.market.code} · {mi.market.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Local lead: {mi.localLead}
                      </p>
                    </div>
                    <StatusBadge label={t.label} tone={t.tone} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {initiative.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet.</p>
              ) : null}
              {initiative.tasks.map((task) => {
                const t = taskStatusTone(task.status);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {task.assignee} · Due {format(task.dueDate, "MMM d, yyyy")}
                      </p>
                    </div>
                    <StatusBadge label={t.label} tone={t.tone} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {initiative.risks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No risks recorded.</p>
              ) : null}
              {initiative.risks.map((risk) => {
                const t = riskSeverityTone(risk.severity);
                return (
                  <div
                    key={risk.id}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {risk.title}
                      </p>
                      <p className="text-xs text-muted-foreground">Owner: {risk.owner}</p>
                    </div>
                    <StatusBadge label={t.label} tone={t.tone} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meetings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {initiative.meetings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No meetings recorded.</p>
              ) : null}
              {initiative.meetings.map((m) => (
                <div key={m.id} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(m.date, "EEE, MMM d yyyy")} · {meetingTypeLabel(m.type)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

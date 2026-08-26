import { Target, AlertTriangle, ListChecks, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings";
import { MilestoneHeatmap } from "@/components/dashboard/milestone-heatmap";

export const dynamic = "force-dynamic";

function detectedMarketMilestones(meetings:{title:string;notes:string;date:Date}[]){
  const relevant=meetings.filter(m=>m.date<=new Date());
  const onboarding=relevant.some(m=>/onboard|kick.?off/.test(`${m.title} ${m.notes}`.toLowerCase()));
  const followup=relevant.some(m=>/1:1|1-1|follow.?up|follow up/.test(`${m.title} ${m.notes}`.toLowerCase()));
  return followup?2:onboarding?1:0;
}

export default async function DashboardPage() {
  const [markets, initiatives, openTasksCount, openRisksCount, activities, upcomingMeetings] = await Promise.all([
    prisma.market.findMany({ orderBy: { name: "asc" }, include:{meetings:{select:{title:true,notes:true,date:true}}} }), prisma.initiative.findMany({ orderBy: { code: "asc" } }), prisma.task.count({ where: { status: { not: "DONE" } } }), prisma.risk.count({ where: { status: "OPEN" } }), prisma.activity.findMany({ orderBy: { createdAt: "desc" }, take: 8 }), prisma.meeting.findMany({ where: { date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 5, include: { market: true, initiative: true } }),
  ]);
  const atRiskCount = initiatives.filter((i) => i.status !== "ON_TRACK").length + markets.filter((m) => m.status !== "ON_TRACK").length;
  const heatmapMarkets=markets.map(m=>({id:m.id,name:m.name,milestoneCompleted:m.milestoneCompleted>0?m.milestoneCompleted:detectedMarketMilestones(m.meetings)}));
  return <div className="pih-dashboard">
    <div className="pih-dashboard-hero"><PageHeader title="Dashboard – Vincent Test" description="Program-wide overview of the sales transformation initiative." /></div>
    <div className="pih-kpi-grid grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Active Initiatives" value={initiatives.length} icon={Target} hint="Across all markets" />
      <KpiCard label="At Risk / Critical" value={atRiskCount} icon={AlertTriangle} tone={atRiskCount > 0 ? "warning" : "default"} hint="Markets & initiatives" />
      <KpiCard label="Open Tasks" value={openTasksCount} icon={ListChecks} hint="Not yet completed" />
      <KpiCard label="Open Risks" value={openRisksCount} icon={ShieldAlert} tone={openRisksCount > 0 ? "critical" : "default"} hint="Requiring mitigation" />
    </div>
    <div className="mt-6"><MilestoneHeatmap markets={heatmapMarkets} /></div>
    <div className="pih-bento-primary mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><StatusOverview title="Markets" href="/markets" items={markets} /><StatusOverview title="Initiatives" href="/initiatives" items={initiatives.map((i) => ({ ...i, code: i.code }))} /></div>
    <div className="pih-bento-secondary mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2"><ActivityTimeline items={activities} /><UpcomingMeetings items={upcomingMeetings.map((m) => ({ id:m.id,title:m.title,type:m.type,date:m.date,scopeLabel:m.scope === "MARKET" ? (m.market?.name ?? "Market") : (m.initiative?.name ?? "Initiative") }))} /></div>
  </div>;
}

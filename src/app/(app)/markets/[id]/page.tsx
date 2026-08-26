import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { MilestoneJourney } from "@/components/markets/milestone-journey";
import { NotesCard } from "@/components/markets/notes-card";
import { healthTone,meetingTypeLabel } from "@/lib/status";

function detectedMarketMilestones(meetings:{title:string;notes:string;date:Date}[]){
  const relevant=meetings.filter(m=>m.date<=new Date());
  const onboarding=relevant.some(m=>/onboard|kick.?off/.test(`${m.title} ${m.notes}`.toLowerCase()));
  const followup=relevant.some(m=>/1:1|1-1|follow.?up|follow up/.test(`${m.title} ${m.notes}`.toLowerCase()));
  return followup?2:onboarding?1:0;
}

export default async function MarketDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const market=await prisma.market.findUnique({where:{id},include:{initiatives:{include:{initiative:true}},meetings:{orderBy:{date:"desc"}},documents:{orderBy:{createdAt:"desc"}},notes:{orderBy:{createdAt:"desc"},include:{initiative:true}}}});
  if(!market)notFound();
  const {label,tone}=healthTone(market.status);
  const linkedInitiatives=market.initiatives.map(mi=>({id:mi.initiative.id,code:mi.initiative.code,name:mi.initiative.name}));
  const notes=market.notes.map(n=>({id:n.id,content:n.content,createdAt:n.createdAt,initiative:{id:n.initiative.id,code:n.initiative.code,name:n.initiative.name}}));
  return <div>
    <PageHeader title={market.name} description={`${market.region} · Market Lead: ${market.lead}`} actions={<StatusBadge label={label} tone={tone}/>}/>
    <Card className="mb-4"><CardHeader><CardTitle className="text-base">Implementation Milestones</CardTitle></CardHeader><CardContent><MilestoneJourney marketId={market.id} marketName={market.name} autoCompleted={detectedMarketMilestones(market.meetings)} savedCompleted={market.milestoneCompleted}/></CardContent></Card>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle className="text-base">Linked Initiatives</CardTitle></CardHeader><CardContent className="space-y-3">{market.initiatives.map(mi=><Link key={mi.id} href={`/initiatives/${mi.initiativeId}`} className="block rounded-lg border p-3"><p className="text-sm font-medium">{mi.initiative.code} · {mi.initiative.name}</p><p className="text-xs text-muted-foreground">Local lead: {mi.localLead}</p></Link>)}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Documents ({market.documents.length})</CardTitle></CardHeader><CardContent className="space-y-3">{market.documents.length===0&&<p className="text-sm text-muted-foreground">No documents uploaded yet.</p>}{market.documents.map(d=><div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div className="min-w-0"><p className="flex items-center gap-2 truncate text-sm font-medium"><FileText className="h-4 w-4"/>{d.name}</p><p className="text-xs text-muted-foreground">Uploaded {format(d.createdAt,"MMM d, yyyy")} · {(d.size/1024/1024).toFixed(2)} MB</p></div><a className="text-sm font-medium underline" target="_blank" rel="noreferrer" href={`/api/documents/file?pathname=${encodeURIComponent(d.pathname)}`}>Open</a></div>)}</CardContent></Card>
      <NotesCard marketId={market.id} initiatives={linkedInitiatives} notes={notes}/>
      <Card><CardHeader><CardTitle className="text-base">Meetings</CardTitle></CardHeader><CardContent className="space-y-3">{market.meetings.map(m=><div key={m.id} className="rounded-lg border p-3"><p className="text-sm font-medium">{m.title}</p><p className="text-xs text-muted-foreground">{format(m.date,"EEE, MMM d yyyy")} · {meetingTypeLabel(m.type)}</p></div>)}</CardContent></Card>
    </div>
  </div>
}

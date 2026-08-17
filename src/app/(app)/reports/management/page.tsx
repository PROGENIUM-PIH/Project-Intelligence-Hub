import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ReportPrintButton } from "@/components/reports/report-print-button";

function pretty(value: string) {
  return value.toLowerCase().split("_").map((p) => p[0]?.toUpperCase() + p.slice(1)).join(" ");
}

function date(value: Date | null | undefined) {
  return value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(value) : "-";
}

export default async function ManagementReportPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const marketId = params.marketId;
  const initiativeId = params.initiativeId;
  const weeks = Math.min(Math.max(Number(params.weeks || 6), 1), 52);
  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

  const [market, initiative, allMeetings, tasks, risks, activities] = await Promise.all([
    marketId ? prisma.market.findUnique({ where: { id: marketId } }) : null,
    initiativeId ? prisma.initiative.findUnique({ where: { id: initiativeId } }) : null,
    prisma.meeting.findMany({ where: { date: { gte: since } }, orderBy: { date: "desc" } }),
    initiativeId ? prisma.task.findMany({ where: { initiativeId }, orderBy: { dueDate: "asc" } }) : [],
    initiativeId ? prisma.risk.findMany({ where: { initiativeId }, orderBy: [{ severity: "desc" }, { updatedAt: "desc" }] }) : [],
    prisma.activity.findMany({ where: { createdAt: { gte: since } }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  const marketNeedles = market ? [market.name.toLowerCase(), market.code.toLowerCase()] : [];
  const initiativeNeedle = initiative?.code.toLowerCase();
  const meetings = allMeetings.filter((m) => {
    const text = `${m.title}\n${m.notes}`.toLowerCase();
    return (!marketId || m.marketId === marketId || marketNeedles.some((n) => text.includes(n))) && (!initiativeId || m.initiativeId === initiativeId || (!!initiativeNeedle && text.includes(initiativeNeedle)));
  });
  const scopedActivities = activities.filter((a) => {
    const text = `${a.type} ${a.description}`.toLowerCase();
    return a.entityId === marketId || a.entityId === initiativeId || marketNeedles.some((n) => text.includes(n)) || (!!initiativeNeedle && text.includes(initiativeNeedle));
  }).slice(0, 8);
  const openTasks = tasks.filter((t) => t.status !== "DONE").slice(0, 8);
  const openRisks = risks.filter((r) => r.status !== "CLOSED").slice(0, 5);
  const nextDeadline = openTasks.find((t) => t.dueDate >= new Date())?.dueDate ?? initiative?.targetDate;
  const sourceSummary = meetings[0]?.notes?.split(/\n+/).filter(Boolean).slice(0, 3).join(" ") || scopedActivities[0]?.description || "No recent narrative source has been captured for this scope yet.";

  return (
    <div className="report-shell -m-6 min-h-screen bg-[#F4F5F3] text-[#0E3A2F]">
      <style>{`
        .report-page{font-family:var(--font-sans),Arial,Helvetica,sans-serif}.report-card{break-inside:avoid}.report-table{width:100%;border-collapse:collapse}.report-table th{background:#0E3A2F;color:white;text-align:left}.report-table th,.report-table td{padding:9px 10px;border-bottom:1px solid #d9dfdc;font-size:11px;vertical-align:top}.report-kicker{letter-spacing:.16em;text-transform:uppercase;font-size:10px;font-weight:900}.report-source{font-size:10px;color:#5e716a}
        @media print{aside,header,.report-actions{display:none!important}.report-shell{margin:0!important;background:white!important}.report-page{max-width:none!important;padding:0!important}.report-card{box-shadow:none!important}@page{size:A4;margin:12mm}body{background:white!important}}
      `}</style>
      <div className="report-actions mx-auto flex max-w-[1100px] items-center justify-between px-8 py-5">
        <Link href="/reports" className="flex items-center gap-2 text-sm font-medium"><ArrowLeft className="h-4 w-4"/>Back to Reports</Link>
        <ReportPrintButton />
      </div>
      <main className="report-page mx-auto max-w-[1100px] space-y-5 px-8 pb-12">
        <section className="report-card overflow-hidden rounded-2xl bg-[#0E3A2F] text-white shadow-sm">
          <div className="h-2 bg-[#78FAAE]" />
          <div className="p-8">
            <div className="report-kicker text-[#78FAAE]">Project Intelligence Hub · Management Report</div>
            <div className="mt-5 flex items-end justify-between gap-6">
              <div><h1 className="text-3xl font-black tracking-tight">{market?.name ?? "All Markets"} · {initiative?.code ?? "Portfolio"}</h1><p className="mt-2 max-w-2xl text-sm font-light text-white/70">{initiative?.name ?? "Cross-initiative management overview"} · Last {weeks} weeks</p></div>
              <div className="text-right text-xs text-white/65">Generated<br/><span className="text-sm font-black text-white">{date(new Date())}</span></div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-3">
          {[["Status", initiative ? pretty(initiative.status) : market ? pretty(market.status) : "-"], ["Progress", initiative ? `${initiative.progress}%` : "-"], ["Open Risks", String(openRisks.length)], ["Next Deadline", date(nextDeadline)]].map(([k,v]) => <div key={k} className="report-card rounded-xl border border-[#dce2df] bg-white p-4"><div className="report-kicker text-[#6c7e77]">{k}</div><div className="mt-2 text-xl font-black">{v}</div></div>)}
        </section>

        <section className="report-card rounded-xl bg-white p-6 shadow-sm"><div className="report-kicker text-[#00A36C]">Executive Summary</div><p className="mt-3 text-sm font-normal leading-6 text-[#314b42]">{sourceSummary}</p></section>

        <section className="grid grid-cols-[1.15fr_.85fr] gap-5">
          <div className="report-card rounded-xl bg-white p-6 shadow-sm"><div className="report-kicker text-[#00A36C]">What happened</div><div className="mt-4 space-y-3">{(meetings.length ? meetings.slice(0,4).map((m) => ({ date:m.date, title:m.title, text:m.notes })) : scopedActivities.map((a)=>({date:a.createdAt,title:a.type,text:a.description}))).map((item,i)=><div key={i} className="border-l-2 border-[#78FAAE] pl-4"><div className="text-xs font-black">{date(item.date)} · {item.title}</div><p className="mt-1 line-clamp-3 text-xs font-light leading-5 text-[#53675f]">{item.text}</p></div>)}</div></div>
          <div className="report-card rounded-xl bg-[#E8FFF1] p-6"><div className="report-kicker text-[#007A51]">Management Attention Required</div><div className="mt-4 space-y-4">{openRisks.length ? openRisks.slice(0,3).map((r,i)=><div key={r.id}><div className="text-sm font-black">{i+1}. {r.title}</div><p className="mt-1 text-xs font-light leading-5 text-[#405b51]">{pretty(r.severity)} · Owner: {r.owner}. {r.description}</p></div>) : <p className="text-sm">No open structured risks are currently recorded.</p>}</div></div>
        </section>

        <section className="report-card overflow-hidden rounded-xl bg-white shadow-sm"><div className="p-5"><div className="report-kicker text-[#00A36C]">Upcoming Deadlines</div></div><table className="report-table"><thead><tr><th>Date</th><th>Action</th><th>Owner</th><th>Status</th></tr></thead><tbody>{openTasks.length ? openTasks.map(t=><tr key={t.id}><td>{date(t.dueDate)}</td><td><strong>{t.title}</strong><br/><span className="text-[#64766f]">{t.description}</span></td><td>{t.assignee}</td><td>{pretty(t.status)}</td></tr>) : <tr><td colSpan={4}>No open deadlines are currently recorded for this initiative.</td></tr>}</tbody></table></section>

        <section className="report-card overflow-hidden rounded-xl bg-white shadow-sm"><div className="p-5"><div className="report-kicker text-[#00A36C]">Key Challenges</div></div><table className="report-table"><thead><tr><th>Severity</th><th>Challenge</th><th>Owner</th><th>Status</th></tr></thead><tbody>{openRisks.length ? openRisks.map(r=><tr key={r.id}><td>{pretty(r.severity)}</td><td><strong>{r.title}</strong><br/><span className="text-[#64766f]">{r.description}</span></td><td>{r.owner}</td><td>{pretty(r.status)}</td></tr>) : <tr><td colSpan={4}>No open structured risks are currently recorded.</td></tr>}</tbody></table></section>

        <section className="report-card rounded-xl bg-white p-6 shadow-sm"><div className="report-kicker text-[#00A36C]">Source Trail</div><div className="mt-4 grid grid-cols-2 gap-3">{meetings.slice(0,4).map(m=><div key={m.id} className="rounded-lg border border-[#dce2df] p-3"><div className="text-xs font-black">{m.title}</div><div className="report-source mt-1">Meeting Notes · {date(m.date)}</div></div>)}{scopedActivities.slice(0,4).map(a=><div key={a.id} className="rounded-lg border border-[#dce2df] p-3"><div className="text-xs font-black">{a.type}</div><div className="report-source mt-1">{a.actor} · {date(a.createdAt)}</div></div>)}</div></section>

        <footer className="flex items-center justify-between border-t border-[#ccd6d1] py-4 text-[10px] text-[#6c7e77]"><span>PROJECT INTELLIGENCE HUB</span><span>Management report · {market?.code ?? "ALL"} · {initiative?.code ?? "ALL"}</span></footer>
      </main>
    </div>
  );
}

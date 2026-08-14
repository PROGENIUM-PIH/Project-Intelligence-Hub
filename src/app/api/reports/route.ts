import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const marketId = params.get("marketId") || undefined;
  const initiativeId = params.get("initiativeId") || undefined;
  const weeks = Math.min(Math.max(Number(params.get("weeks") || 6), 1), 52);
  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

  const [market, initiative, meetings, tasks, risks, activities] = await Promise.all([
    marketId ? prisma.market.findUnique({ where: { id: marketId }, select: { id: true, name: true, code: true, status: true } }) : null,
    initiativeId ? prisma.initiative.findUnique({ where: { id: initiativeId }, select: { id: true, code: true, name: true, status: true, progress: true, targetDate: true } }) : null,
    prisma.meeting.findMany({ where: { date: { gte: since }, ...(marketId ? { marketId } : {}), ...(initiativeId ? { initiativeId } : {}) }, orderBy: { date: "desc" } }),
    initiativeId ? prisma.task.findMany({ where: { initiativeId, OR: [{ updatedAt: { gte: since } }, { dueDate: { gte: since } }] }, orderBy: { dueDate: "asc" } }) : [],
    initiativeId ? prisma.risk.findMany({ where: { initiativeId, updatedAt: { gte: since } }, orderBy: { updatedAt: "desc" } }) : [],
    prisma.activity.findMany({ where: { createdAt: { gte: since }, OR: [ ...(marketId ? [{ entityType: "Market", entityId: marketId }] : []), ...(initiativeId ? [{ entityType: "Initiative", entityId: initiativeId }] : []), ...(marketId || initiativeId ? [] : [{}]) ] }, orderBy: { createdAt: "desc" } }),
  ]);

  const rows: string[][] = [["Record Type","Date","Market","Initiative","Status / Severity","Owner / Actor","Deadline","Title / Summary","Details","Source"]];
  const marketLabel = market ? `${market.name} (${market.code})` : "All markets";
  const initiativeLabel = initiative ? `${initiative.code} — ${initiative.name}` : "All initiatives";

  for (const meeting of meetings) rows.push(["Meeting", meeting.date.toISOString(), marketLabel, initiativeLabel, "", "", "", meeting.title, meeting.notes, "Meeting Notes"]);
  for (const task of tasks) rows.push(["Task", task.updatedAt.toISOString(), marketLabel, initiativeLabel, task.status, task.assignee, task.dueDate.toISOString(), task.title, task.description, "Task"]);
  for (const risk of risks) rows.push(["Risk", risk.updatedAt.toISOString(), marketLabel, initiativeLabel, `${risk.severity} / ${risk.status}`, risk.owner, "", risk.title, risk.description, "Risk"]);
  for (const activity of activities) rows.push(["Activity", activity.createdAt.toISOString(), marketLabel, initiativeLabel, "", activity.actor, "", activity.type, activity.description, activity.description.match(/\[Source: ([^\]]+)\]/)?.[1] ?? "Activity History"]);
  if (initiative) rows.push(["Current Initiative Snapshot", new Date().toISOString(), marketLabel, initiativeLabel, initiative.status, "", initiative.targetDate.toISOString(), `${initiative.progress}% progress`, initiative.name, "Structured Data"]);
  if (market) rows.push(["Current Market Snapshot", new Date().toISOString(), marketLabel, initiativeLabel, market.status, "", "", market.name, "Current market status", "Structured Data"]);

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const filename = `project-report-${market?.code ?? "all"}-${initiative?.code ?? "all"}-${weeks}w.csv`.toLowerCase();
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"` } });
}

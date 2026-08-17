import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value).replaceAll("\r\n", "\n");
  return `"${text.replaceAll('"', '""')}"`;
}

function excelDate(value: Date | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const marketId = params.get("marketId") || undefined;
  const initiativeId = params.get("initiativeId") || undefined;
  const weeks = Math.min(Math.max(Number(params.get("weeks") || 6), 1), 52);
  const since = new Date(Date.now() - weeks * 7 * 24 * 60 * 60 * 1000);

  const [market, initiative, recentMeetings, tasks, risks, activities] = await Promise.all([
    marketId
      ? prisma.market.findUnique({
          where: { id: marketId },
          select: { id: true, name: true, code: true, status: true },
        })
      : null,
    initiativeId
      ? prisma.initiative.findUnique({
          where: { id: initiativeId },
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
            progress: true,
            targetDate: true,
            owner: true,
          },
        })
      : null,
    prisma.meeting.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "desc" },
    }),
    initiativeId
      ? prisma.task.findMany({
          where: {
            initiativeId,
            OR: [{ updatedAt: { gte: since } }, { dueDate: { gte: since } }],
          },
          orderBy: { dueDate: "asc" },
        })
      : [],
    initiativeId
      ? prisma.risk.findMany({
          where: { initiativeId },
          orderBy: { updatedAt: "desc" },
        })
      : [],
    prisma.activity.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const marketLabel = market ? `${market.name} (${market.code})` : "All markets";
  const initiativeLabel = initiative ? `${initiative.code} — ${initiative.name}` : "All initiatives";
  const initiativeNeedle = initiative?.code.toLowerCase();
  const marketNeedles = market ? [market.name.toLowerCase(), market.code.toLowerCase()] : [];

  // Meeting Notes currently support one direct scope (Market OR Initiative). For reports,
  // include directly linked records and notes that explicitly mention the other selected scope.
  const meetings = recentMeetings.filter((meeting) => {
    if (!marketId && !initiativeId) return true;
    const searchable = `${meeting.title}\n${meeting.notes}`.toLowerCase();
    const matchesMarket = !marketId || meeting.marketId === marketId || marketNeedles.some((needle) => searchable.includes(needle));
    const matchesInitiative = !initiativeId || meeting.initiativeId === initiativeId || (!!initiativeNeedle && searchable.includes(initiativeNeedle));
    return matchesMarket && matchesInitiative;
  });

  const scopedActivities = activities.filter((activity) => {
    if (!marketId && !initiativeId) return true;
    const searchable = `${activity.type}\n${activity.description}`.toLowerCase();
    const directMarket = !!marketId && activity.entityType === "Market" && activity.entityId === marketId;
    const directInitiative = !!initiativeId && activity.entityType === "Initiative" && activity.entityId === initiativeId;
    const textMarket = !marketId || marketNeedles.some((needle) => searchable.includes(needle));
    const textInitiative = !initiativeId || (!!initiativeNeedle && searchable.includes(initiativeNeedle));
    return directMarket || directInitiative || (textMarket && textInitiative);
  });

  const rows: string[][] = [];

  rows.push(["PROJECT INTELLIGENCE HUB — MANAGEMENT REPORT"]);
  rows.push(["Market", marketLabel]);
  rows.push(["Initiative", initiativeLabel]);
  rows.push(["Reporting period", `Last ${weeks} weeks`]);
  rows.push(["Generated", excelDate(new Date())]);
  rows.push([]);

  rows.push(["CURRENT STATUS"]);
  rows.push(["Item", "Value"]);
  if (market) rows.push(["Market status", label(market.status)]);
  if (initiative) {
    rows.push(["Initiative status", label(initiative.status)]);
    rows.push(["Progress", `${initiative.progress}%`]);
    rows.push(["Initiative owner", initiative.owner]);
    rows.push(["Target date", excelDate(initiative.targetDate)]);
  }
  rows.push([]);

  rows.push(["UPCOMING DEADLINES / ACTIONS"]);
  rows.push(["Due Date", "Status", "Priority", "Owner", "Action", "Details"]);
  if (tasks.length === 0) rows.push(["", "", "", "", "No matching tasks found", ""]);
  for (const task of tasks) {
    rows.push([
      excelDate(task.dueDate),
      label(task.status),
      label(task.priority),
      task.assignee,
      task.title,
      task.description,
    ]);
  }
  rows.push([]);

  rows.push(["CHALLENGES / RISKS"]);
  rows.push(["Severity", "Status", "Owner", "Risk", "Description", "Last Updated"]);
  if (risks.length === 0) rows.push(["", "", "", "No matching risks found", "", ""]);
  for (const risk of risks) {
    rows.push([
      label(risk.severity),
      label(risk.status),
      risk.owner,
      risk.title,
      risk.description,
      excelDate(risk.updatedAt),
    ]);
  }
  rows.push([]);

  rows.push(["WHAT HAPPENED — MEETINGS / SOURCE NOTES"]);
  rows.push(["Date", "Meeting", "Source Notes"]);
  if (meetings.length === 0) rows.push(["", "No matching meeting notes found", ""]);
  for (const meeting of meetings) {
    rows.push([excelDate(meeting.date), meeting.title, meeting.notes]);
  }
  rows.push([]);

  rows.push(["PROJECT ACTIVITY / AUDIT TRAIL"]);
  rows.push(["Date", "Type", "Actor", "Update", "Source"]);
  if (scopedActivities.length === 0) rows.push(["", "", "", "No matching activity found", ""]);
  for (const activity of scopedActivities) {
    rows.push([
      excelDate(activity.createdAt),
      activity.type,
      activity.actor,
      activity.description.replace(/^\[Source: [^\]]+\]\s*/, ""),
      activity.description.match(/\[Source: ([^\]]+)\]/)?.[1] ?? "Activity History",
    ]);
  }

  // Semicolon delimiter + UTF-8 BOM opens cleanly in German/European Excel locales.
  const csv = "\uFEFF" + rows.map((row) => row.map(csvCell).join(";")).join("\r\n");
  const filename = `project-report-${market?.code ?? "all"}-${initiative?.code ?? "all"}-${weeks}w.csv`.toLowerCase();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

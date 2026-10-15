"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const meetingSchema = z
  .object({
    title: z.string().min(3),
    type: z.enum(["STATUS_REVIEW", "STEERING_COMMITTEE", "WORKSHOP", "KICKOFF", "OTHER"]),
    scope: z.enum(["MARKET", "INITIATIVE"]),
    date: z.coerce.date(),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional().nullable(),
    notes: z.string().default(""),
    participants: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    documentUrl: z.string().optional().nullable(),
    marketId: z.string().optional().nullable(),
    initiativeId: z.string().optional().nullable(),
  })
  .refine((data) => !data.endTime || data.endTime > `${String(data.date.getHours()).padStart(2, "0")}:${String(data.date.getMinutes()).padStart(2, "0")}`, { message: "End time must be after start time.", path: ["endTime"] })
  .refine((data) => (data.scope === "MARKET" ? !!data.marketId : !!data.initiativeId), {
    message: "Select a market or initiative matching the chosen scope.",
    path: ["marketId"],
  });

const calendarImportSchema = z.array(
  z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    notes: z.string().default("Imported from Outlook calendar."),
    marketId: z.string().optional().nullable(),
    initiativeId: z.string().optional().nullable(),
  }).refine((data) => !!data.marketId || !!data.initiativeId, {
    message: "Assign at least one market or initiative before importing.",
  })
).min(1);

export type MeetingInput = z.infer<typeof meetingSchema>;

function normalize(input: MeetingInput) {
  return {
    title: input.title,
    type: input.type,
    scope: input.scope,
    date: input.date,
    endTime: input.endTime || null,
    notes: input.notes || "",
    participants: input.participants || null,
    location: input.location || null,
    documentUrl: input.documentUrl || null,
    marketId: input.scope === "MARKET" ? (input.marketId ?? null) : null,
    initiativeId: input.scope === "INITIATIVE" ? (input.initiativeId ?? null) : null,
  };
}


// Extract only explicitly marked action items; never turn general meeting notes into tasks.
function extractActions(notes: string) {
  const lines = notes.split(/\r?\n/);
  const actions: { title: string; assignee: string; dueDate: Date | null }[] = [];
  for (const line of lines) {
    const match = line.trim().match(/^(?:[-*]\s*)?(?:\[\s*\]\s*)?(?:ACTION|TASK|TODO|ACTION ITEM|AUFGABE|TO-DO)\s*[:\-]\s*(.+)$/i);
    if (!match) continue;
    let title = match[1].trim();
    const owner = title.match(/(?:\s+\|\s*|\s+)(?:owner|assignee|responsible|verantwortlich)\s*:\s*([^|]+?)(?=\s*\||$)/i);
    const due = title.match(/(?:\s+\|\s*|\s+)(?:due|deadline|fällig)\s*:\s*(\d{4}-\d{2}-\d{2})(?=\s*\||$)/i);
    const assignee = owner?.[1]?.trim() || "Unassigned";
    const dueDate = due ? new Date(due[1] + "T12:00:00Z") : null;
    title = title.replace(/\s*\|?\s*(?:owner|assignee|responsible|verantwortlich|due|deadline|fällig)\s*:\s*[^|]+/gi, "").trim();
    if (title.length >= 3 && (!dueDate || !Number.isNaN(dueDate.getTime())) && !actions.some(a => a.title.toLowerCase() === title.toLowerCase())) actions.push({title, assignee, dueDate});
  }
  return actions;
}

async function syncMeetingActions(meeting: {id:string; title:string; notes:string; date:Date; marketId:string|null; initiativeId:string|null}) {
  const marker = `[Meeting:${meeting.id}]`;
  const actions = extractActions(meeting.notes);
  const existing = await prisma.task.findMany({where:{description:{contains:marker}}});
  for (const action of actions) {
    const previous = existing.find(t => t.title.toLowerCase() === action.title.toLowerCase());
    if (previous) continue;
    await prisma.task.create({data:{
      title:action.title,
      description:`Automatically imported from meeting "${meeting.title}" ${marker}`,
      assignee:action.assignee,
      dueDate:action.dueDate ?? meeting.date,
      marketId:meeting.marketId,
      initiativeId:meeting.initiativeId,
    }});
  }
}

export async function createMeeting(input: MeetingInput) {
  const parsed = meetingSchema.parse(input);
  const data = normalize(parsed);
  const meeting = await prisma.meeting.create({ data });
  await syncMeetingActions(meeting);
  await prisma.activity.create({
    data: {
      type: "MEETING_SCHEDULED",
      description: `Scheduled meeting "${meeting.title}"`,
      entityType: "Meeting",
      entityId: meeting.id,
      actor: "You",
    },
  });
  revalidatePath("/meetings");
  revalidatePath("/dashboard");
  if (meeting.marketId) revalidatePath(`/markets/${meeting.marketId}`);
  if (meeting.initiativeId) revalidatePath(`/initiatives/${meeting.initiativeId}`);
  return meeting;
}

export async function importCalendarMeetings(input: unknown) {
  const meetings = calendarImportSchema.parse(input);
  const created = [];
  for (const item of meetings) {
    const meeting = await prisma.meeting.create({
      data: {
        title: item.title,
        type: "OTHER",
        scope: item.initiativeId ? "INITIATIVE" : "MARKET",
        date: item.date,
        notes: item.notes || "Imported from Outlook calendar.",
        marketId: item.marketId ?? null,
        initiativeId: item.initiativeId ?? null,
      },
    });
    created.push(meeting);
    await prisma.activity.create({
      data: {
        type: "CALENDAR_MEETING_IMPORTED",
        description: `Imported calendar meeting "${meeting.title}"`,
        entityType: "Meeting",
        entityId: meeting.id,
        actor: "You",
      },
    });
  }
  revalidatePath("/meetings");
  revalidatePath("/dashboard");
  return { count: created.length };
}

export async function updateMeeting(id: string, input: MeetingInput) {
  const parsed = meetingSchema.parse(input);
  const data = normalize(parsed);
  const meeting = await prisma.meeting.update({ where: { id }, data });
  await syncMeetingActions(meeting);
  revalidatePath("/meetings");
  revalidatePath("/dashboard");
  if (meeting.marketId) revalidatePath(`/markets/${meeting.marketId}`);
  if (meeting.initiativeId) revalidatePath(`/initiatives/${meeting.initiativeId}`);
  return meeting;
}

export async function deleteMeeting(id: string) {
  await prisma.meeting.delete({ where: { id } });
  revalidatePath("/meetings");
  revalidatePath("/dashboard");
}

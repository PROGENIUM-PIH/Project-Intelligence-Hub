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
    notes: z.string().min(1),
    marketId: z.string().optional().nullable(),
    initiativeId: z.string().optional().nullable(),
  })
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
    notes: input.notes,
    marketId: input.scope === "MARKET" ? (input.marketId ?? null) : null,
    initiativeId: input.scope === "INITIATIVE" ? (input.initiativeId ?? null) : null,
  };
}

export async function createMeeting(input: MeetingInput) {
  const parsed = meetingSchema.parse(input);
  const data = normalize(parsed);
  const meeting = await prisma.meeting.create({ data });
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
  revalidatePath("/meetings");
  revalidatePath("/dashboard");
  return meeting;
}

export async function deleteMeeting(id: string) {
  await prisma.meeting.delete({ where: { id } });
  revalidatePath("/meetings");
  revalidatePath("/dashboard");
}

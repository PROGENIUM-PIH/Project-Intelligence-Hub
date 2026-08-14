"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const healthSchema = z.enum(["ON_TRACK", "AT_RISK", "CRITICAL"]);
const manualUpdateSchema = z.object({ entityType: z.enum(["MARKET", "INITIATIVE"]), entityId: z.string().min(1), status: healthSchema.optional(), updateText: z.string().min(3), nextStep: z.string().optional().default(""), riskNote: z.string().optional().default("") });
export type ManualUpdateInput = z.infer<typeof manualUpdateSchema>;

export async function saveManualUpdate(input: ManualUpdateInput) {
  console.log("[intake:manual] save started", { entityType: input.entityType, entityId: input.entityId });
  try {
    const parsed = manualUpdateSchema.parse(input);
    const entity = parsed.entityType === "MARKET" ? await prisma.market.findUnique({ where: { id: parsed.entityId }, select: { id: true, name: true } }) : await prisma.initiative.findUnique({ where: { id: parsed.entityId }, select: { id: true, code: true, name: true } });
    if (!entity) throw new Error("Selected entity no longer exists.");
    const entityLabel = "name" in entity && "code" in entity ? `${entity.code} ${entity.name}` : entity.name;
    if (parsed.status) {
      if (parsed.entityType === "MARKET") await prisma.market.update({ where: { id: parsed.entityId }, data: { status: parsed.status } });
      else await prisma.initiative.update({ where: { id: parsed.entityId }, data: { status: parsed.status } });
    }
    const detailParts = [parsed.updateText.trim()];
    if (parsed.nextStep.trim()) detailParts.push(`Next step: ${parsed.nextStep.trim()}`);
    if (parsed.riskNote.trim()) detailParts.push(`Risk: ${parsed.riskNote.trim()}`);
    if (parsed.status) detailParts.push(`Status: ${parsed.status}`);
    await prisma.activity.create({ data: { type: "MANUAL_UPDATE", description: `[Source: Manual Update] ${entityLabel} — ${detailParts.join(" | ")}`, entityType: parsed.entityType === "MARKET" ? "Market" : "Initiative", entityId: parsed.entityId, actor: "You" } });
    revalidatePath("/dashboard"); revalidatePath("/updates"); revalidatePath("/markets"); revalidatePath("/initiatives");
    console.log("[intake:manual] save completed", { entityType: parsed.entityType, entityId: parsed.entityId });
    return { ok: true } as const;
  } catch (error) {
    console.error("[intake:manual] save failed", { error: error instanceof Error ? error.message : String(error) });
    throw new Error("The update could not be stored. Please retry; if it persists, check the preview runtime logs.");
  }
}

const meetingNotesSchema = z.object({ title: z.string().min(3), scope: z.enum(["MARKET", "INITIATIVE"]), entityId: z.string().min(1), notes: z.string().min(10) });
export type MeetingNotesInput = z.infer<typeof meetingNotesSchema>;

export async function saveMeetingNotes(input: MeetingNotesInput) {
  console.log("[intake:meeting] save started", { scope: input.scope, entityId: input.entityId, title: input.title, noteLength: input.notes?.length ?? 0 });
  try {
    const parsed = meetingNotesSchema.parse(input);
    const linkedEntityExists = parsed.scope === "MARKET"
      ? await prisma.market.findUnique({ where: { id: parsed.entityId }, select: { id: true } })
      : await prisma.initiative.findUnique({ where: { id: parsed.entityId }, select: { id: true } });
    if (!linkedEntityExists) throw new Error("The selected market or initiative no longer exists.");

    const meeting = await prisma.$transaction(async (tx) => {
      const created = await tx.meeting.create({ data: { title: parsed.title, type: "STATUS_REVIEW", scope: parsed.scope, date: new Date(), notes: parsed.notes, marketId: parsed.scope === "MARKET" ? parsed.entityId : null, initiativeId: parsed.scope === "INITIATIVE" ? parsed.entityId : null } });
      await tx.activity.create({ data: { type: "MEETING_NOTES_INGESTED", description: `[Source: Meeting Notes] Saved and reviewed notes from "${created.title}"`, entityType: "Meeting", entityId: created.id, actor: "You" } });
      return created;
    });

    revalidatePath("/meetings"); revalidatePath("/dashboard"); revalidatePath("/updates");
    console.log("[intake:meeting] save completed", { meetingId: meeting.id });
    return { ok: true, meetingId: meeting.id } as const;
  } catch (error) {
    console.error("[intake:meeting] save failed", { error: error instanceof Error ? error.message : String(error) });
    throw new Error("The meeting notes could not be stored. Please retry; if it persists, check the preview runtime logs.");
  }
}

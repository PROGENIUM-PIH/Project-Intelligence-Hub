"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const riskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["OPEN", "MITIGATED", "CLOSED"]),
  owner: z.string().min(1),
  identifiedDate: z.coerce.date(),
  initiativeId: z.string().min(1),
});

export type RiskInput = z.infer<typeof riskSchema>;

export async function createRisk(input: RiskInput) {
  const data = riskSchema.parse(input);
  const risk = await prisma.risk.create({ data });
  await prisma.activity.create({
    data: {
      type: "RISK_RAISED",
      description: `Raised risk "${risk.title}"`,
      entityType: "Risk",
      entityId: risk.id,
      actor: "You",
    },
  });
  revalidatePath("/risks");
  revalidatePath("/dashboard");
  revalidatePath(`/initiatives/${risk.initiativeId}`);
  return risk;
}

export async function updateRisk(id: string, input: RiskInput) {
  const data = riskSchema.parse(input);
  const risk = await prisma.risk.update({ where: { id }, data });
  revalidatePath("/risks");
  revalidatePath("/dashboard");
  revalidatePath(`/initiatives/${risk.initiativeId}`);
  return risk;
}

export async function deleteRisk(id: string) {
  const risk = await prisma.risk.delete({ where: { id } });
  revalidatePath("/risks");
  revalidatePath("/dashboard");
  revalidatePath(`/initiatives/${risk.initiativeId}`);
}

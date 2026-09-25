"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const statusSchema = z.enum(["ON_TRACK", "AT_RISK", "CRITICAL"]);

export async function recalculateMarketStatus(marketId: string) {
  const links = await prisma.marketInitiative.findMany({
    where: { marketId },
    select: { localStatus: true },
  });

  // Markets without linked initiatives keep their existing manually maintained status.
  if (links.length === 0) return null;

  // Business rule: the market reflects the most severe local rollout status.
  const status = links.some((link) => link.localStatus === "CRITICAL")
    ? "CRITICAL"
    : links.some((link) => link.localStatus === "AT_RISK")
      ? "AT_RISK"
      : "ON_TRACK";

  await prisma.market.update({
    where: { id: marketId },
    data: { status },
  });

  return status;
}

export async function updateMarketInitiativeStatus(linkId: string, status: string) {
  const parsedStatus = statusSchema.parse(status);
  const link = await prisma.marketInitiative.update({
    where: { id: linkId },
    data: { localStatus: parsedStatus },
    include: { market: { select: { id: true, name: true } }, initiative: { select: { id: true, code: true, name: true } } },
  });

  const marketStatus = await recalculateMarketStatus(link.market.id);

  await prisma.activity.create({
    data: {
      type: "MARKET_INITIATIVE_STATUS_UPDATED",
      description: `${link.market.name} · ${link.initiative.code} local rollout status changed to ${parsedStatus.replaceAll("_", " ")}; market health recalculated to ${marketStatus?.replaceAll("_", " ") ?? "UNCHANGED"}`,
      entityType: "MarketInitiative",
      entityId: link.id,
      actor: "You",
    },
  });

  revalidatePath(`/markets/${link.market.id}`);
  revalidatePath(`/initiatives/${link.initiative.id}`);
  revalidatePath("/markets");
  revalidatePath("/initiatives");
  revalidatePath("/dashboard");
  return { ok: true } as const;
}

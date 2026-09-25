"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().trim().min(1),
  role: z.string().trim().optional(),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export async function updateContact(contactId: string, input: z.infer<typeof contactSchema>) {
  const data = contactSchema.parse(input);
  const contact = await prisma.contact.update({
    where: { id: contactId },
    data: {
      name: data.name,
      role: data.role || null,
      email: data.email || null,
      phone: data.phone || null,
    },
    include: {
      markets: { select: { marketId: true } },
      initiatives: {
        include: {
          initiative: {
            select: { markets: { select: { marketId: true } } },
          },
        },
      },
    },
  });

  const marketIds = new Set(contact.markets.map((link) => link.marketId));
  contact.initiatives.forEach((link) =>
    link.initiative.markets.forEach((market) => marketIds.add(market.marketId)),
  );
  marketIds.forEach((marketId) => revalidatePath(`/markets/${marketId}`));
  revalidatePath("/markets");
  return { ok: true } as const;
}

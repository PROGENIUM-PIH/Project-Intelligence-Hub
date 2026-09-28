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

function revalidateContacts() {
  revalidatePath("/markets");
  revalidatePath("/initiatives");
}

export async function updateContact(contactId: string, input: z.infer<typeof contactSchema>) {
  const data = contactSchema.parse(input);
  const contact = await prisma.contact.update({
    where: { id: contactId },
    data: { name: data.name, role: data.role || null, email: data.email || null, phone: data.phone || null },
    include: {
      markets: { select: { marketId: true } },
      initiatives: { include: { initiative: { select: { id: true, markets: { select: { marketId: true } } } } } },
    },
  });
  contact.markets.forEach((link) => revalidatePath(`/markets/${link.marketId}`));
  contact.initiatives.forEach((link) => {
    revalidatePath(`/initiatives/${link.initiative.id}`);
    link.initiative.markets.forEach((market) => revalidatePath(`/markets/${market.marketId}`));
  });
  revalidateContacts();
  return { ok: true } as const;
}

export async function createMarketContact(marketId: string, input: z.infer<typeof contactSchema>) {
  const data = contactSchema.parse(input);
  await prisma.contact.create({
    data: {
      name: data.name, role: data.role || null, email: data.email || null, phone: data.phone || null,
      markets: { create: { marketId } },
    },
  });
  revalidatePath(`/markets/${marketId}`); revalidateContacts();
  return { ok: true } as const;
}

export async function assignExistingContactToMarket(marketId: string, contactId: string) {
  await prisma.marketContact.upsert({ where: { marketId_contactId: { marketId, contactId } }, create: { marketId, contactId }, update: {} });
  revalidatePath(`/markets/${marketId}`); revalidateContacts();
  return { ok: true } as const;
}

export async function removeMarketContact(marketId: string, contactId: string) {
  await prisma.marketContact.deleteMany({ where: { marketId, contactId } });
  revalidatePath(`/markets/${marketId}`); revalidateContacts();
  return { ok: true } as const;
}

export async function createInitiativeContact(initiativeId: string, input: z.infer<typeof contactSchema>) {
  const data = contactSchema.parse(input);
  const initiative = await prisma.initiative.findUniqueOrThrow({ where: { id: initiativeId }, select: { markets: { select: { marketId: true } } } });
  await prisma.contact.create({
    data: {
      name: data.name, role: data.role || null, email: data.email || null, phone: data.phone || null,
      initiatives: { create: { initiativeId } },
    },
  });
  revalidatePath(`/initiatives/${initiativeId}`);
  initiative.markets.forEach((market) => revalidatePath(`/markets/${market.marketId}`));
  revalidateContacts();
  return { ok: true } as const;
}

export async function assignExistingContactToInitiative(initiativeId: string, contactId: string) {
  await prisma.initiativeContact.upsert({ where: { initiativeId_contactId: { initiativeId, contactId } }, create: { initiativeId, contactId }, update: {} });
  const initiative = await prisma.initiative.findUniqueOrThrow({ where: { id: initiativeId }, select: { markets: { select: { marketId: true } } } });
  revalidatePath(`/initiatives/${initiativeId}`);
  initiative.markets.forEach((market) => revalidatePath(`/markets/${market.marketId}`));
  revalidateContacts();
  return { ok: true } as const;
}

export async function removeInitiativeContact(initiativeId: string, contactId: string) {
  await prisma.initiativeContact.deleteMany({ where: { initiativeId, contactId } });
  const initiative = await prisma.initiative.findUniqueOrThrow({ where: { id: initiativeId }, select: { markets: { select: { marketId: true } } } });
  revalidatePath(`/initiatives/${initiativeId}`);
  initiative.markets.forEach((market) => revalidatePath(`/markets/${market.marketId}`));
  revalidateContacts();
  return { ok: true } as const;
}

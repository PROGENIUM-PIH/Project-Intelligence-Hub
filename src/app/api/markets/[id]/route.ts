import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const lead = typeof body?.lead === "string" ? body.lead.trim() : "";

  if (!lead) return NextResponse.json({ error: "Market owner is required." }, { status: 400 });

  try {
    const market = await prisma.market.update({ where: { id }, data: { lead }, select: { id: true, lead: true } });
    return NextResponse.json(market);
  } catch {
    return NextResponse.json({ error: "Could not update market owner." }, { status: 500 });
  }
}

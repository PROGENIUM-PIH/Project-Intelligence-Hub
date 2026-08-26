import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    const marketId = typeof body.marketId === "string" ? body.marketId : "";
    const initiativeId = typeof body.initiativeId === "string" ? body.initiativeId : "";
    if (!content || !marketId || !initiativeId) return NextResponse.json({ error: "Note, market and initiative are required." }, { status: 400 });

    const [market, initiative] = await Promise.all([
      prisma.market.findUnique({ where: { id: marketId }, select: { id: true } }),
      prisma.initiative.findUnique({ where: { id: initiativeId }, select: { id: true } }),
    ]);
    if (!market || !initiative) return NextResponse.json({ error: "Market or initiative not found." }, { status: 400 });

    const note = await prisma.note.create({ data: { content, marketId, initiativeId } });
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save note." }, { status: 500 });
  }
}

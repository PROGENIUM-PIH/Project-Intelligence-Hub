import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const completed = Number(body.completed);

  if (!Number.isInteger(completed) || completed < 0 || completed > 5) {
    return NextResponse.json({ error: "Milestone progress must be an integer between 0 and 5." }, { status: 400 });
  }

  try {
    const market = await prisma.market.update({
      where: { id },
      data: { milestoneCompleted: completed, milestoneUpdatedAt: new Date() },
      select: { id: true, milestoneCompleted: true, milestoneUpdatedAt: true },
    });
    return NextResponse.json(market);
  } catch {
    return NextResponse.json({ error: "Unable to save milestone progress." }, { status: 500 });
  }
}

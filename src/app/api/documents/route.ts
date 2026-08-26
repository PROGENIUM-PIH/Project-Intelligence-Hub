import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Document id is required." }, { status: 400 });
    }

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    await del(document.blobUrl);
    await prisma.document.delete({ where: { id } });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Document deletion failed", error);
    return NextResponse.json({ error: "Could not delete document." }, { status: 500 });
  }
}

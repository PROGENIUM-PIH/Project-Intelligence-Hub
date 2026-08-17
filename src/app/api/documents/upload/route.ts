import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function safeSegment(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "unassigned";
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const contextType = String(form.get("contextType") || "");
    const contextCode = String(form.get("contextCode") || "");
    const entityId = String(form.get("entityId") || "");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    if (!entityId || (contextType !== "MARKET" && contextType !== "INITIATIVE")) {
      return NextResponse.json({ error: "A market or initiative must be assigned." }, { status: 400 });
    }

    const allowed = [".ppt", ".pptx", ".pdf", ".xls", ".xlsx", ".doc", ".docx", ".txt"];
    if (!allowed.some((extension) => file.name.toLowerCase().endsWith(extension))) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const pathname = `documents/${safeSegment(contextType.toLowerCase())}/${safeSegment(contextCode)}/${timestamp}-${safeSegment(file.name)}`;
    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type || undefined,
    });

    const data = {
      name: file.name,
      pathname: blob.pathname,
      blobUrl: blob.url,
      contentType: blob.contentType,
      size: file.size,
      marketId: contextType === "MARKET" ? entityId : null,
      initiativeId: contextType === "INITIATIVE" ? entityId : null,
    };

    const document = await prisma.document.create({ data });
    return NextResponse.json({
      stored: true,
      documentId: document.id,
      pathname: blob.pathname,
      url: blob.url,
      contentType: blob.contentType,
      size: file.size,
      uploadedAt: document.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Document upload failed", error);
    return NextResponse.json({ error: "Document storage failed." }, { status: 500 });
  }
}

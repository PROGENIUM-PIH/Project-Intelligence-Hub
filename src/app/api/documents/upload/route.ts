import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function safeSegment(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "unassigned";
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const contextType = String(form.get("contextType") || "PROJECT");
    const contextCode = String(form.get("contextCode") || "unassigned");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const allowed = [".ppt", ".pptx", ".pdf", ".xls", ".xlsx", ".doc", ".docx", ".txt"];
    const lowerName = file.name.toLowerCase();
    if (!allowed.some((extension) => lowerName.endsWith(extension))) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const pathname = `documents/${safeSegment(contextType.toLowerCase())}/${safeSegment(contextCode)}/${timestamp}-${safeSegment(file.name)}`;

    const blob = await put(pathname, file, {
      access: "private",
      addRandomSuffix: true,
      contentType: file.type || undefined,
    });

    return NextResponse.json({
      stored: true,
      pathname: blob.pathname,
      url: blob.url,
      contentType: blob.contentType,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Document upload failed", error);
    return NextResponse.json({ error: "Document storage failed." }, { status: 500 });
  }
}

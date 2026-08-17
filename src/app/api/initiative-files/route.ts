import { del, put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["ppt", "pptx", "xls", "xlsx", "csv", "pdf", "doc", "docx", "txt", "zip"]);

function extension(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

export async function POST(request: NextRequest) {
  let uploadedBlobUrl: string | null = null;
  try {
    const form = await request.formData();
    const file = form.get("file");
    const initiativeId = String(form.get("initiativeId") ?? "");

    if (!(file instanceof File) || !initiativeId) {
      return NextResponse.json({ error: "Choose an initiative and a file." }, { status: 400 });
    }
    if (!ALLOWED_EXTENSIONS.has(extension(file.name))) {
      return NextResponse.json({ error: "Unsupported file type. Upload PPT/PPTX, XLS/XLSX/CSV, PDF, DOC/DOCX, TXT or ZIP." }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File is too large. The MVP limit is 25 MB per file." }, { status: 400 });
    }

    const initiative = await prisma.initiative.findUnique({ where: { id: initiativeId }, select: { id: true, code: true, name: true } });
    if (!initiative) return NextResponse.json({ error: "Initiative not found." }, { status: 404 });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const blob = await put(`initiatives/${initiative.code}/${Date.now()}-${safeName}`, file, { access: "private", addRandomSuffix: true });
    uploadedBlobUrl = blob.url;

    const document = await prisma.$transaction(async (tx) => {
      const created = await tx.initiativeDocument.create({
        data: {
          fileName: file.name,
          blobUrl: blob.url,
          blobPathname: blob.pathname,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          uploadedBy: "Initiative Owner",
          initiativeId: initiative.id,
        },
      });
      await tx.activity.create({
        data: {
          type: "INITIATIVE_FILE_UPLOADED",
          description: `[Source: File Upload] ${initiative.code} — ${file.name} | Document ${created.id}`,
          entityType: "Initiative",
          entityId: initiative.id,
          actor: "Initiative Owner",
        },
      });
      return created;
    });

    return NextResponse.json({ ok: true, documentId: document.id, fileName: file.name, initiative: initiative.code });
  } catch (error) {
    if (uploadedBlobUrl) {
      try { await del(uploadedBlobUrl); } catch (cleanupError) { console.error("[initiative-files] blob cleanup failed", cleanupError); }
    }
    console.error("[initiative-files] upload failed", error);
    const message = error instanceof Error && /token|blob|store/i.test(error.message)
      ? "File storage is not connected yet. Connect a private Vercel Blob store to this project and retry."
      : "The file could not be uploaded. Please retry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

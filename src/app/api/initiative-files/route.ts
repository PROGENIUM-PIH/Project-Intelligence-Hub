import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["ppt", "pptx", "xls", "xlsx", "csv", "pdf", "doc", "docx", "txt", "zip"]);

function extension(name: string) {
  return name.toLowerCase().split(".").pop() ?? "";
}

export async function POST(request: NextRequest) {
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

    await prisma.activity.create({
      data: {
        type: "INITIATIVE_FILE_UPLOADED",
        description: `[Source: File Upload] ${initiative.code} — ${file.name} | ${file.size} bytes | ${blob.url}`,
        entityType: "Initiative",
        entityId: initiative.id,
        actor: "Initiative Owner",
      },
    });

    return NextResponse.json({ ok: true, fileName: file.name, initiative: initiative.code });
  } catch (error) {
    console.error("[initiative-files] upload failed", error);
    const message = error instanceof Error && /token|blob|store/i.test(error.message)
      ? "File storage is not connected yet. Connect a Vercel Blob store to this project and retry."
      : "The file could not be uploaded. Please retry.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

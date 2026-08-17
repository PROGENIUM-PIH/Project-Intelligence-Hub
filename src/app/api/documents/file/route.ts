import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");
  const download = request.nextUrl.searchParams.get("download") === "1";

  if (!pathname || !pathname.startsWith("documents/")) {
    return NextResponse.json({ error: "Invalid document path." }, { status: 400 });
  }

  // This route is intentionally the single PIH access point for private files.
  // When application authentication/roles are enabled, enforce the signed-in
  // user's Market / Initiative permissions here before calling Blob.
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const filename = pathname.split("/").pop() || "document";
  const headers = new Headers();
  if (result.blob.contentType) headers.set("Content-Type", result.blob.contentType);
  headers.set("Content-Disposition", `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(filename)}`);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");

  return new NextResponse(result.stream, { status: 200, headers });
}

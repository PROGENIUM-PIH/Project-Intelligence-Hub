import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function extractOutputText(data: unknown) {
  if (!data || typeof data !== "object") return "";
  const response = data as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  if (typeof response.output_text === "string") return response.output_text.trim();
  return (response.output ?? [])
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === "output_text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export async function POST(request: Request) {
  try {
    const { marketId } = await request.json();
    if (!marketId || typeof marketId !== "string") {
      return NextResponse.json({ error: "Market is required." }, { status: 400 });
    }

    const market = await prisma.market.findUnique({
      where: { id: marketId },
      select: {
        name: true,
        code: true,
        notes: {
          orderBy: { createdAt: "asc" },
          select: {
            content: true,
            createdAt: true,
            initiative: { select: { code: true, name: true } },
          },
        },
      },
    });

    if (!market) return NextResponse.json({ error: "Market not found." }, { status: 404 });
    if (market.notes.length === 0) return NextResponse.json({ error: "No notes available yet." }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured in Vercel yet." }, { status: 503 });
    }

    const timeline = market.notes.map((note) =>
      `[${note.createdAt.toISOString()}] ${note.initiative.code} · ${note.initiative.name}\n${note.content}`
    ).join("\n\n");

    const instructions = `You are a senior PMO analyst. Summarize the CURRENT status of one market from a chronological note history. Newer notes override older information when they conflict. Do not repeat superseded facts. Preserve uncertainty where the notes are unclear. Separate current status, initiative updates, open points, decisions, and risks only when supported by the notes. Keep the output concise, management-ready, and factual. Do not invent information.`;

    const input = `Market: ${market.name} (${market.code})\n\nChronological notes (oldest to newest):\n${timeline}\n\nCreate a concise current-status summary. Start with \"Overall:\" and then use short sections for relevant initiative updates and open points/risks/decisions. End with \"Based on notes through: <latest note date>\".`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SUMMARY_MODEL || "gpt-5-mini",
        instructions,
        input,
        max_output_tokens: 700,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const message = typeof data?.error?.message === "string" ? data.error.message : "AI summary failed.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const summary = extractOutputText(data);
    if (!summary) return NextResponse.json({ error: "AI returned an empty summary." }, { status: 502 });

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: "Could not summarize notes." }, { status: 500 });
  }
}

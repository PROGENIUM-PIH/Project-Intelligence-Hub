import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.OUTLOOK_CALENDAR_ICS_URL;

  if (!url) {
    return NextResponse.json(
      { error: "Calendar feed is not configured." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8" },
    });

    if (!response.ok) {
      console.error("Outlook calendar feed failed", response.status, response.statusText);
      return NextResponse.json(
        { error: "Outlook calendar feed could not be loaded." },
        { status: 502 },
      );
    }

    const calendar = await response.text();
    return new NextResponse(calendar, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Outlook calendar feed error", error);
    return NextResponse.json(
      { error: "Outlook calendar feed could not be loaded." },
      { status: 502 },
    );
  }
}

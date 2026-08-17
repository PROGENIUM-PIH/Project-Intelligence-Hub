import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowedCalendarUrl(value: string) {
  try {
    const url = new URL(value);
    const allowedHost = url.hostname === "outlook.office365.com" || url.hostname === "outlook.office.com";
    return url.protocol === "https:" && allowedHost && url.pathname.toLowerCase().endsWith("/calendar.ics");
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const url = String(body?.url || "").trim();

    if (!isAllowedCalendarUrl(url)) {
      return NextResponse.json(
        { error: "Please enter a valid Outlook calendar .ics link." },
        { status: 400 },
      );
    }

    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Outlook calendar feed could not be loaded. Check that the published ICS link is still active." },
        { status: 502 },
      );
    }

    const calendar = await response.text();
    if (!calendar.includes("BEGIN:VCALENDAR")) {
      return NextResponse.json(
        { error: "The provided link did not return a valid calendar feed." },
        { status: 400 },
      );
    }

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

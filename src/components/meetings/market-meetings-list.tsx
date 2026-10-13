"use client";

import { useState } from "react";
import { MarketMeetingButton, type MarketMeeting } from "@/components/meetings/market-meeting-button";
import { meetingTypeLabel } from "@/lib/status";

type Market = { id: string; code: string; name: string };
type Tab = "UPCOMING" | "PAST";

export function MarketMeetingsList({ market, meetings }: { market: Market; meetings: MarketMeeting[] }) {
  const [tab, setTab] = useState<Tab>("UPCOMING");
  const now = Date.now();
  const visibleMeetings = meetings
    .filter((meeting) => tab === "UPCOMING"
      ? new Date(meeting.date).getTime() >= now
      : new Date(meeting.date).getTime() < now)
    .sort((a, b) => tab === "UPCOMING"
      ? new Date(a.date).getTime() - new Date(b.date).getTime()
      : new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-3">
      <div className="flex w-fit rounded-lg border bg-background p-1" role="group" aria-label="Meeting timeframe">
        {(["UPCOMING", "PAST"] as Tab[]).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => setTab(value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${tab === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          >
            {value === "UPCOMING" ? "Upcoming" : "Past"}
          </button>
        ))}
      </div>
      {visibleMeetings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {tab === "UPCOMING" ? "No upcoming meetings scheduled." : "No past meetings recorded."}
        </p>
      ) : (
        <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
          {visibleMeetings.map((meeting) => (
            <MarketMeetingButton key={meeting.id} market={market} meeting={meeting}>
              <div className="rounded-lg border p-3 transition-colors hover:bg-secondary/40">
                <p className="text-sm font-medium">{meeting.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("en-GB", {
                    weekday: "short", day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Berlin",
                  }).format(new Date(meeting.date))} · {meetingTypeLabel(meeting.type)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">Click to view or edit</p>
              </div>
            </MarketMeetingButton>
          ))}
        </div>
      )}
    </div>
  );
}

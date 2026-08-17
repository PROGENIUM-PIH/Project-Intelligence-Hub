"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, Check, FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { importCalendarMeetings } from "@/lib/actions/meetings";

type Option = { id: string; code: string; name: string };
type ParsedMeeting = {
  id: string;
  selected: boolean;
  title: string;
  start: Date;
  end?: Date;
  organizer?: string;
  attendees: string[];
  location?: string;
  description?: string;
  marketId: string;
  initiativeId: string;
};

function unfold(text: string) {
  return text.replace(/\r?\n[ \t]/g, "");
}

function unescapeIcs(value: string) {
  return value.replace(/\\n/gi, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}

function parseDate(value: string) {
  const v = value.trim();
  if (/^\d{8}$/.test(v)) {
    return new Date(Number(v.slice(0,4)), Number(v.slice(4,6))-1, Number(v.slice(6,8)));
  }
  if (/^\d{8}T\d{6}Z$/.test(v)) {
    return new Date(Date.UTC(Number(v.slice(0,4)),Number(v.slice(4,6))-1,Number(v.slice(6,8)),Number(v.slice(9,11)),Number(v.slice(11,13)),Number(v.slice(13,15))));
  }
  if (/^\d{8}T\d{6}$/.test(v)) {
    return new Date(Number(v.slice(0,4)),Number(v.slice(4,6))-1,Number(v.slice(6,8)),Number(v.slice(9,11)),Number(v.slice(11,13)),Number(v.slice(13,15)));
  }
  return new Date(v);
}

function valueFor(block: string, key: string) {
  const line = block.split(/\r?\n/).find((l) => l.toUpperCase().startsWith(key.toUpperCase() + ":") || l.toUpperCase().startsWith(key.toUpperCase() + ";"));
  if (!line) return "";
  return unescapeIcs(line.slice(line.indexOf(":") + 1));
}

function valuesFor(block: string, key: string) {
  return block.split(/\r?\n/)
    .filter((l) => l.toUpperCase().startsWith(key.toUpperCase() + ":") || l.toUpperCase().startsWith(key.toUpperCase() + ";"))
    .map((line) => unescapeIcs(line.slice(line.indexOf(":") + 1)).replace(/^mailto:/i, ""));
}

function parseIcs(text: string): ParsedMeeting[] {
  const normalized = unfold(text);
  const blocks = normalized.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  return blocks.map((block, index) => {
    const startRaw = valueFor(block, "DTSTART");
    const endRaw = valueFor(block, "DTEND");
    return {
      id: `${index}-${valueFor(block, "UID") || valueFor(block, "SUMMARY")}`,
      selected: true,
      title: valueFor(block, "SUMMARY") || "Untitled meeting",
      start: parseDate(startRaw),
      end: endRaw ? parseDate(endRaw) : undefined,
      organizer: valueFor(block, "ORGANIZER").replace(/^mailto:/i, "") || undefined,
      attendees: valuesFor(block, "ATTENDEE"),
      location: valueFor(block, "LOCATION") || undefined,
      description: valueFor(block, "DESCRIPTION") || undefined,
      marketId: "",
      initiativeId: "",
    };
  }).filter((meeting) => !Number.isNaN(meeting.start.getTime()));
}

export function CalendarImport({ markets, initiatives, onImported }: { markets: Option[]; initiatives: Option[]; onImported: () => void }) {
  const [meetings, setMeetings] = useState<ParsedMeeting[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setFileName(file.name);
    const parsed = parseIcs(await file.text());
    if (!parsed.length) {
      setMeetings([]);
      setError("No calendar events were found in this .ics file.");
      return;
    }
    setMeetings(parsed);
  }

  function patch(id: string, values: Partial<ParsedMeeting>) {
    setMeetings((current) => current.map((meeting) => meeting.id === id ? { ...meeting, ...values } : meeting));
  }

  async function importSelected() {
    const selected = meetings.filter((m) => m.selected);
    const incomplete = selected.some((m) => !m.marketId && !m.initiativeId);
    if (!selected.length) return setError("Select at least one meeting to import.");
    if (incomplete) return setError("Assign every selected meeting to at least one market or initiative.");
    setSaving(true);
    setError("");
    try {
      await importCalendarMeetings(selected.map((m) => ({
        title: m.title,
        date: m.start,
        marketId: m.marketId || null,
        initiativeId: m.initiativeId || null,
        notes: [
          "Imported from Outlook calendar.",
          m.end ? `End: ${m.end.toISOString()}` : "",
          m.organizer ? `Organizer: ${m.organizer}` : "",
          m.attendees.length ? `Participants: ${m.attendees.join(", ")}` : "",
          m.location ? `Location: ${m.location}` : "",
          m.description ? `\n${m.description}` : "",
        ].filter(Boolean).join("\n"),
      })));
      onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calendar import failed.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="space-y-4">
    <div className="rounded-xl border bg-secondary/30 p-4">
      <CalendarDays className="mb-2 h-5 w-5" />
      <p className="font-medium">Manual Outlook calendar import</p>
      <p className="mt-1 text-sm text-muted-foreground">Upload an Outlook .ics file. PIH reads title, date/time, organizer, participants, location and description. Then assign the relevant project context before saving.</p>
    </div>

    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-sm font-medium hover:bg-secondary/30">
      <FileUp className="h-4 w-4" />
      {fileName || "Upload Outlook calendar (.ics)"}
      <Input className="hidden" type="file" accept=".ics,text/calendar" onChange={(e) => loadFile(e.target.files?.[0])} />
    </label>

    {error && <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}

    {meetings.length > 0 && <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="font-semibold">{meetings.length} meetings detected</p><Button variant="ghost" size="sm" onClick={() => setMeetings((items) => items.map((m) => ({ ...m, selected: true })))}>Select all</Button></div>
      <div className="max-h-[52vh] space-y-3 overflow-y-auto pr-1">
        {meetings.map((meeting) => <div key={meeting.id} className="rounded-xl border p-4">
          <div className="flex gap-3">
            <input className="mt-1 h-4 w-4" type="checkbox" checked={meeting.selected} onChange={(e) => patch(meeting.id, { selected: e.target.checked })} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{meeting.title}</p>
              <p className="text-sm text-muted-foreground">{format(meeting.start, "EEE, MMM d yyyy · HH:mm")}{meeting.end ? ` – ${format(meeting.end, "HH:mm")}` : ""}</p>
              {(meeting.organizer || meeting.attendees.length > 0 || meeting.location) && <p className="mt-1 truncate text-xs text-muted-foreground">{[meeting.organizer && `Organizer: ${meeting.organizer}`, meeting.attendees.length && `${meeting.attendees.length} participants`, meeting.location].filter(Boolean).join(" · ")}</p>}
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-medium">Market
                  <select className="h-9 rounded-md border bg-background px-2 text-sm" value={meeting.marketId} onChange={(e) => patch(meeting.id, { marketId: e.target.value })}>
                    <option value="">No market</option>{markets.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-medium">Initiative
                  <select className="h-9 rounded-md border bg-background px-2 text-sm" value={meeting.initiativeId} onChange={(e) => patch(meeting.id, { initiativeId: e.target.value })}>
                    <option value="">No initiative</option>{initiatives.map((i) => <option key={i.id} value={i.id}>{i.code} — {i.name}</option>)}
                  </select>
                </label>
              </div>
            </div>
          </div>
        </div>)}
      </div>
      <div className="flex justify-end"><Button className="bg-[#78FAAE] text-[#0D3B32] hover:bg-[#78FAAE]/90" onClick={importSelected} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Import selected meetings</Button></div>
    </div>}
  </div>;
}

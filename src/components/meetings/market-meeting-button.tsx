"use client";

import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createMeeting } from "@/lib/actions/meetings";

type Market = { id: string; code: string; name: string };

export function MarketMeetingButton({ market }: { market: Market }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(`${market.name} status review`);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [participants, setParticipants] = useState("");
  const [location, setLocation] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [error, setError] = useState("");

  async function save() {
    if (!date || title.trim().length < 3) return;
    setSaving(true);
    setError("");
    try {
      await createMeeting({ title, type: "STATUS_REVIEW", scope: "MARKET", date: new Date(date), notes: notes.trim(), participants: participants.trim(), location: location.trim(), documentUrl: documentUrl.trim(), marketId: market.id, initiativeId: null });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not schedule meeting.");
    } finally {
      setSaving(false);
    }
  }

  return <div>
    <Button type="button" onClick={() => setOpen((v) => !v)} className="bg-[#0E3A2F] text-white hover:bg-[#0E3A2F]/90"><CalendarPlus className="h-4 w-4" />Add Meeting</Button>
    {open ? <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/20 px-4 pb-8 pt-[5vh]" onMouseDown={(e) => { if (e.currentTarget === e.target) setOpen(false); }}><div className="w-full max-w-2xl rounded-xl border bg-card p-6 shadow-2xl">
      <div className="mb-4 flex items-start justify-between"><div><p className="font-semibold">Add Market Meeting</p><p className="text-xs text-muted-foreground">Linked directly to {market.name}.</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4" /></button></div>
      <div className="space-y-4">
        <label className="grid gap-1.5 text-sm">Title<input className="h-10 rounded-md border bg-background px-3" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label className="grid gap-1.5 text-sm">Date & time<input type="datetime-local" className="h-10 rounded-md border bg-background px-3" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-sm">Participants<input className="h-10 rounded-md border bg-background px-3" value={participants} onChange={(e) => setParticipants(e.target.value)} /></label><label className="grid gap-1.5 text-sm">Location<input className="h-10 rounded-md border bg-background px-3" value={location} onChange={(e) => setLocation(e.target.value)} /></label></div><label className="grid gap-1.5 text-sm">Meeting document<input className="h-10 rounded-md border bg-background px-3" placeholder="Document link" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} /></label><label className="grid gap-1.5 text-sm">Agenda / notes<textarea className="min-h-24 rounded-md border bg-background p-3" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex justify-end"><Button type="button" onClick={save} disabled={!date || saving}>{saving ? "Scheduling..." : "Schedule meeting"}</Button></div>
      </div>
    </div></div> : null}
  </div>;
}

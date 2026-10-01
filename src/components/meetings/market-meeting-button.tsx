"use client";

import { useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createMeeting, updateMeeting } from "@/lib/actions/meetings";

type Market = { id: string; code: string; name: string };
export type MarketMeeting = { id:string; title:string; type:string; date:Date|string; notes:string; participants:string|null; location:string|null; documentUrl:string|null };

function toLocalInput(value: Date|string) {
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0,16);
}

export function MarketMeetingButton({ market, meeting, children }: { market: Market; meeting?: MarketMeeting; children?: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(meeting?.title ?? `${market.name} status review`);
  const [type, setType] = useState(meeting?.type ?? "STATUS_REVIEW");
  const [date, setDate] = useState(meeting ? toLocalInput(meeting.date) : "");
  const [notes, setNotes] = useState(meeting?.notes ?? "");
  const [participants, setParticipants] = useState(meeting?.participants ?? "");
  const [location, setLocation] = useState(meeting?.location ?? "");
  const [error, setError] = useState("");

  async function save() {
    if (!date || title.trim().length < 3) return;
    setSaving(true); setError("");
    try {
      const payload = { title, type: type as "STATUS_REVIEW"|"STEERING_COMMITTEE"|"WORKSHOP"|"KICKOFF"|"OTHER", scope: "MARKET" as const, date: new Date(date), notes: notes.trim(), participants: participants.trim(), location: location.trim(), documentUrl: meeting?.documentUrl ?? "", marketId: market.id, initiativeId: null };
      if (meeting) await updateMeeting(meeting.id, payload); else await createMeeting(payload);
      setOpen(false); router.refresh();
    } catch { setError("Could not save meeting."); } finally { setSaving(false); }
  }

  return <div>
    {children ? <button type="button" onClick={()=>setOpen(true)} className="w-full text-left">{children}</button> : <Button type="button" onClick={()=>setOpen(true)} className="bg-[#0E3A2F] text-white hover:bg-[#0E3A2F]/90"><CalendarPlus className="h-4 w-4" />Add Meeting</Button>}
    {open ? <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/20 px-4 pb-8 pt-[5vh]" onMouseDown={(e)=>{if(e.currentTarget===e.target)setOpen(false)}}><div className="w-full max-w-2xl rounded-xl border bg-card p-6 shadow-2xl">
      <div className="mb-4 flex items-start justify-between"><div><p className="font-semibold">{meeting ? "Meeting Details" : "Add Market Meeting"}</p><p className="text-xs text-muted-foreground">{meeting ? "Review and update the stored meeting information." : `Linked directly to ${market.name}.`}</p></div><button type="button" onClick={()=>setOpen(false)} className="rounded-md p-1 hover:bg-secondary"><X className="h-4 w-4"/></button></div>
      <div className="space-y-4">
        <label className="grid gap-1.5 text-sm">Title<input className="h-10 rounded-md border bg-background px-3" value={title} onChange={e=>setTitle(e.target.value)}/></label>
        <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-sm">Type<select className="h-10 rounded-md border bg-background px-3" value={type} onChange={e=>setType(e.target.value)}><option value="STATUS_REVIEW">Status Review</option><option value="STEERING_COMMITTEE">Steering Committee</option><option value="WORKSHOP">Workshop</option><option value="KICKOFF">Kickoff</option><option value="OTHER">Other</option></select></label><label className="grid gap-1.5 text-sm">Date & time<input type="datetime-local" className="h-10 rounded-md border bg-background px-3" value={date} onChange={e=>setDate(e.target.value)}/></label></div>
        <div className="grid grid-cols-2 gap-3"><label className="grid gap-1.5 text-sm">Participants<input className="h-10 rounded-md border bg-background px-3" value={participants} onChange={e=>setParticipants(e.target.value)}/></label><label className="grid gap-1.5 text-sm">Location<input className="h-10 rounded-md border bg-background px-3" value={location} onChange={e=>setLocation(e.target.value)}/></label></div>
        <label className="grid gap-1.5 text-sm">Agenda / notes<textarea className="min-h-28 rounded-md border bg-background p-3" value={notes} onChange={e=>setNotes(e.target.value)}/></label>
        {error?<p className="text-sm text-destructive">{error}</p>:null}
        <div className="flex justify-end"><Button type="button" onClick={save} disabled={!date||saving}>{saving?"Saving...":meeting?"Save Changes":"Schedule meeting"}</Button></div>
      </div>
    </div></div>:null}
  </div>;
}

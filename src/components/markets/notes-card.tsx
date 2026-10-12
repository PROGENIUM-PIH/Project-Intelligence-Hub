"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Initiative = { id: string; code: string | null; name: string };
type Note = { id: string; content: string; createdAt: string | Date; initiative: Initiative | null };

export function NotesCard({ marketId, initiatives, notes }: { marketId: string; initiatives: Initiative[]; notes: Note[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [initiativeId, setInitiativeId] = useState("GENERAL");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  async function saveNote() {
    if (!content.trim()) return;
    setSaving(true); setError("");
    const response = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, marketId, initiativeId }) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error ?? "Could not save note."); setSaving(false); return; }
    setContent(""); setSaving(false); setSummary(""); setSummaryError(""); router.refresh();
  }

  async function deleteNote(id: string) {
    if (!window.confirm("Delete this note permanently?")) return;
    setDeletingId(id); setError("");
    try {
      const response = await fetch("/api/notes", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, marketId }) });
      if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.error ?? "Could not delete note."); }
      setSummary(""); setSummaryError(""); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete note."); }
    finally { setDeletingId(null); }
  }

  async function summarizeCurrentStatus() {
    setSummarizing(true); setSummaryError("");
    const response = await fetch("/api/notes/summary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marketId }) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { setSummaryError(data.error ?? "Could not summarize notes."); setSummarizing(false); return; }
    setSummary(data.summary ?? ""); setSummarizing(false);
  }

  return <Card className="min-w-0 overflow-visible">
    <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
    <CardContent className="space-y-4 overflow-visible">
      <div className="space-y-3 rounded-lg border p-3">
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Add a note for this market..." rows={4} className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <select value={initiativeId} onChange={(e)=>setInitiativeId(e.target.value)} className="h-10 min-w-0 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="GENERAL">General</option>
            {initiatives.map(i=><option key={i.id} value={i.id}>{i.code ? `${i.code} · ` : ""}{i.name}</option>)}
          </select>
          <Button className="h-10 w-full whitespace-nowrap xl:w-auto xl:min-w-28" onClick={saveNote} disabled={saving || !content.trim()}>{saving ? "Saving..." : "Save Note"}</Button>
        </div>
        {error&&<p className="text-xs text-destructive">{error}</p>}
      </div>

      <Button className="w-full bg-[#78FAAE] text-[#0D3B32] hover:bg-[#78FAAE]/90" onClick={summarizeCurrentStatus} disabled={notes.length===0 || summarizing}>
        {summarizing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4"/>}
        {summarizing ? "Summarizing..." : "Summarize Current Status"}
      </Button>

      {summaryError&&<div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">{summaryError}</div>}
      {summary&&<div className="rounded-lg border border-[#78FAAE] bg-[#78FAAE]/10 p-4">
        <p className="mb-3 text-sm font-semibold">Current Status</p>
        <div className="whitespace-pre-wrap text-sm leading-6">{summary}</div>
        <p className="mt-3 text-xs text-muted-foreground">Rule-based summary from the note history. Latest initiative updates are combined with explicitly mentioned open points, decisions and risks.</p>
      </div>}

      <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
        {notes.length===0&&<p className="text-sm text-muted-foreground">No notes added yet.</p>}
        {notes.map(note=><div key={note.id} className="rounded-lg border p-3"><div className="mb-1 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium">{note.initiative ? `${note.initiative.code ? `${note.initiative.code} · ` : ""}${note.initiative.name}` : "General"}</p><div className="flex items-center gap-2"><p className="text-xs text-muted-foreground">{format(new Date(note.createdAt), "MMM d, yyyy · HH:mm")}</p><Button type="button" variant="ghost" size="sm" className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700" disabled={deletingId===note.id} onClick={()=>deleteNote(note.id)} aria-label="Delete note" title="Delete note">{deletingId===note.id?<Loader2 className="h-4 w-4 animate-spin"/>:<Trash2 className="h-4 w-4"/>}<span className="ml-1">Delete</span></Button></div></div><p className="whitespace-pre-wrap text-sm">{note.content}</p></div>)}
      </div>
    </CardContent>
  </Card>;
}

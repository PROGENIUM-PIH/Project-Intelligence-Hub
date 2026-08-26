"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Initiative = { id: string; code: string; name: string };
type Note = { id: string; content: string; createdAt: string | Date; initiative: Initiative };

export function NotesCard({ marketId, initiatives, notes }: { marketId: string; initiatives: Initiative[]; notes: Note[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [initiativeId, setInitiativeId] = useState(initiatives[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveNote() {
    if (!content.trim() || !initiativeId) return;
    setSaving(true); setError("");
    const response = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content, marketId, initiativeId }) });
    if (!response.ok) { const data = await response.json().catch(() => ({})); setError(data.error ?? "Could not save note."); setSaving(false); return; }
    setContent(""); setSaving(false); router.refresh();
  }

  return <Card>
    <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3 rounded-lg border p-3">
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Add a note for this market..." rows={4} className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select value={initiativeId} onChange={(e)=>setInitiativeId(e.target.value)} className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm">
            {initiatives.map(i=><option key={i.id} value={i.id}>{i.code} · {i.name}</option>)}
          </select>
          <Button onClick={saveNote} disabled={saving || !content.trim() || !initiativeId}>{saving ? "Saving..." : "Save Note"}</Button>
        </div>
        {initiatives.length===0&&<p className="text-xs text-muted-foreground">Link an initiative to this market before adding notes.</p>}
        {error&&<p className="text-xs text-destructive">{error}</p>}
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-2">
        {notes.length===0&&<p className="text-sm text-muted-foreground">No notes added yet.</p>}
        {notes.map(note=><div key={note.id} className="rounded-lg border p-3"><div className="mb-1 flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium">{note.initiative.code} · {note.initiative.name}</p><p className="text-xs text-muted-foreground">{format(new Date(note.createdAt), "MMM d, yyyy · HH:mm")}</p></div><p className="whitespace-pre-wrap text-sm">{note.content}</p></div>)}
      </div>
    </CardContent>
  </Card>;
}

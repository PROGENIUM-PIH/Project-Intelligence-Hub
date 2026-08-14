"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ClipboardPen, FileText, Sparkles, X } from "lucide-react";
import { AssistantPanel } from "@/components/ai/assistant-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveManualUpdate, saveMeetingNotes } from "@/lib/actions/intake";

type EntityOption = { id: string; label: string; type: "MARKET" | "INITIATIVE" };

type Props = { markets: { id: string; name: string; code: string }[]; initiatives: { id: string; code: string; name: string }[] };

const statusLabels: Record<string, string> = { ON_TRACK: "On Track", AT_RISK: "At Risk", CRITICAL: "Critical" };

export function IntakeWorkbench({ markets, initiatives }: Props) {
  const router = useRouter();
  const options = useMemo<EntityOption[]>(() => [
    ...markets.map((m) => ({ id: m.id, label: `${m.name} (${m.code})`, type: "MARKET" as const })),
    ...initiatives.map((i) => ({ id: i.id, label: `${i.code} — ${i.name}`, type: "INITIATIVE" as const })),
  ], [markets, initiatives]);

  const [manualEntity, setManualEntity] = useState(options[0]?.id ?? "");
  const [status, setStatus] = useState("ON_TRACK");
  const [updateText, setUpdateText] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [riskNote, setRiskNote] = useState("");
  const [manualPreview, setManualPreview] = useState(false);
  const [manualSaved, setManualSaved] = useState(false);

  const [meetingEntity, setMeetingEntity] = useState(options[0]?.id ?? "");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [meetingPreview, setMeetingPreview] = useState(false);
  const [meetingSaved, setMeetingSaved] = useState(false);

  const selectedManual = options.find((o) => o.id === manualEntity);
  const selectedMeeting = options.find((o) => o.id === meetingEntity);

  async function confirmManual() {
    if (!selectedManual) return;
    await saveManualUpdate({ entityType: selectedManual.type, entityId: selectedManual.id, status: status as "ON_TRACK" | "AT_RISK" | "CRITICAL", updateText, nextStep, riskNote });
    setManualPreview(false); setManualSaved(true); setUpdateText(""); setNextStep(""); setRiskNote(""); router.refresh();
  }

  async function confirmMeeting() {
    if (!selectedMeeting) return;
    await saveMeetingNotes({ title: meetingTitle, scope: selectedMeeting.type, entityId: selectedMeeting.id, notes });
    setMeetingPreview(false); setMeetingSaved(true); setMeetingTitle(""); setNotes(""); router.refresh();
  }

  return <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Data Intake</h1>
      <p className="mt-1 text-sm text-muted-foreground">Information arrives → review the structured preview → confirm → dashboard updates. Nothing is written before confirmation.</p>
    </div>

    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader><div className="flex items-center gap-2"><ClipboardPen className="h-5 w-5"/><CardTitle>Manual Update</CardTitle></div><CardDescription>Safe fallback for direct project updates.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <label className="grid gap-1.5 text-sm">Market or initiative<select className="h-10 rounded-md border bg-background px-3" value={manualEntity} onChange={(e)=>setManualEntity(e.target.value)}>{options.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
          <label className="grid gap-1.5 text-sm">Status<select className="h-10 rounded-md border bg-background px-3" value={status} onChange={(e)=>setStatus(e.target.value)}>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
          <Textarea placeholder="What changed?" value={updateText} onChange={(e)=>setUpdateText(e.target.value)} rows={3}/>
          <Input placeholder="Next step (optional)" value={nextStep} onChange={(e)=>setNextStep(e.target.value)}/>
          <Input placeholder="Risk / blocker (optional)" value={riskNote} onChange={(e)=>setRiskNote(e.target.value)}/>
          <Button onClick={()=>{setManualSaved(false);setManualPreview(true)}} disabled={!selectedManual || updateText.trim().length < 3}>Preview Update</Button>
          {manualSaved && <p className="text-sm text-green-700">Manual update confirmed and added to the project history.</p>}
          {manualPreview && selectedManual && <div className="rounded-lg border bg-secondary/40 p-4 text-sm"><p className="mb-3 font-medium">Review before saving</p><p><span className="text-muted-foreground">Target:</span> {selectedManual.label}</p><p><span className="text-muted-foreground">Status:</span> {statusLabels[status]}</p><p className="mt-2">{updateText}</p>{nextStep && <p className="mt-1"><span className="text-muted-foreground">Next step:</span> {nextStep}</p>}{riskNote && <p><span className="text-muted-foreground">Risk:</span> {riskNote}</p>}<div className="mt-4 flex justify-end gap-2"><Button variant="outline" size="sm" onClick={()=>setManualPreview(false)}><X className="h-4 w-4"/>Discard</Button><Button size="sm" onClick={confirmManual}><Check className="h-4 w-4"/>Confirm & Save</Button></div></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><div className="flex items-center gap-2"><FileText className="h-5 w-5"/><CardTitle>Meeting Notes</CardTitle></div><CardDescription>Paste notes or a transcript and preserve the original source in the meeting record.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Meeting title" value={meetingTitle} onChange={(e)=>setMeetingTitle(e.target.value)}/>
          <label className="grid gap-1.5 text-sm">Related market or initiative<select className="h-10 rounded-md border bg-background px-3" value={meetingEntity} onChange={(e)=>setMeetingEntity(e.target.value)}>{options.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}</select></label>
          <Textarea placeholder="Paste meeting notes or transcript here..." value={notes} onChange={(e)=>setNotes(e.target.value)} rows={8}/>
          <Button onClick={()=>{setMeetingSaved(false);setMeetingPreview(true)}} disabled={!selectedMeeting || meetingTitle.trim().length < 3 || notes.trim().length < 10}>Review Notes</Button>
          {meetingSaved && <p className="text-sm text-green-700">Meeting notes confirmed and stored as a traceable source.</p>}
          {meetingPreview && selectedMeeting && <div className="rounded-lg border bg-secondary/40 p-4 text-sm"><p className="mb-3 font-medium">Review source before saving</p><p><span className="text-muted-foreground">Meeting:</span> {meetingTitle}</p><p><span className="text-muted-foreground">Linked to:</span> {selectedMeeting.label}</p><p className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap">{notes}</p><div className="mt-4 flex justify-end gap-2"><Button variant="outline" size="sm" onClick={()=>setMeetingPreview(false)}><X className="h-4 w-4"/>Discard</Button><Button size="sm" onClick={confirmMeeting}><Check className="h-4 w-4"/>Confirm & Save</Button></div></div>}
        </CardContent>
      </Card>
    </div>

    <div>
      <div className="mb-3 flex items-center gap-2"><Sparkles className="h-5 w-5"/><h2 className="text-lg font-semibold">AI Command Bar</h2></div>
      <AssistantPanel />
    </div>
  </div>;
}

"use client";

import { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Props = { markets: { id: string; name: string; code: string }[]; initiatives: { id: string; code: string; name: string }[] };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasToken(text: string, token: string) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(token.toLowerCase())}([^a-z0-9]|$)`, "i").test(text);
}

export function ReportsClient({ markets, initiatives }: Props) {
  const [marketId, setMarketId] = useState(markets[0]?.id ?? "");
  const [initiativeId, setInitiativeId] = useState(initiatives[0]?.id ?? "");
  const [weeks, setWeeks] = useState("6");
  const [prompt, setPrompt] = useState("Please give me an overview about ID4 in Germany for the last 6 weeks. What did we do, where are the challenges, what are the deadlines?");
  const selectedMarket = markets.find((m) => m.id === marketId);
  const selectedInitiative = initiatives.find((i) => i.id === initiativeId);
  const query = useMemo(() => `marketId=${encodeURIComponent(marketId)}&initiativeId=${encodeURIComponent(initiativeId)}&weeks=${encodeURIComponent(weeks)}`, [marketId, initiativeId, weeks]);
  const downloadUrl = `/api/reports?${query}`;
  const managementUrl = `/reports/management?${query}`;

  function interpretPrompt() {
    const lower = prompt.toLowerCase();

    const market = markets.find((m) =>
      lower.includes(m.name.toLowerCase()) || hasToken(lower, m.code)
    );

    const explicitInitiativeMatch = lower.match(/\bid\s*0*(\d+)\b/i);
    let initiative = initiatives.find((i) =>
      hasToken(lower, i.code) || lower.includes(i.name.toLowerCase())
    );

    if (!initiative && explicitInitiativeMatch) {
      const requestedNumber = Number(explicitInitiativeMatch[1]);
      initiative = initiatives.find((i) => {
        const codeMatch = i.code.match(/(\d+)/);
        return codeMatch ? Number(codeMatch[1]) === requestedNumber : false;
      });
    }

    const weekMatch = lower.match(/(?:last|past)\s+(\d+)\s+weeks?/);

    if (market) setMarketId(market.id);
    if (initiative) setInitiativeId(initiative.id);
    if (weekMatch) setWeeks(weekMatch[1]);
  }

  return <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
    <Card><CardHeader><div className="flex items-center gap-2"><Sparkles className="h-5 w-5"/><CardTitle>Ask for a report</CardTitle></div><CardDescription>Describe the management question and prepare the report scope.</CardDescription></CardHeader><CardContent className="space-y-4">
      <Textarea rows={6} value={prompt} onChange={(e)=>setPrompt(e.target.value)} />
      <Button onClick={interpretPrompt}>Prepare Report Scope</Button>
      <div className="rounded-lg border bg-secondary/40 p-4 text-sm"><p className="font-medium">Report will cover</p><p className="mt-2"><span className="text-muted-foreground">Market:</span> {selectedMarket?.name ?? "—"}</p><p><span className="text-muted-foreground">Initiative:</span> {selectedInitiative?.code ?? "—"}</p><p><span className="text-muted-foreground">Period:</span> Last {weeks} weeks</p></div>
      <Button asChild className="w-full bg-[#78FAAE] text-[#0E3A2F] hover:bg-[#63e89a]"><a href={managementUrl}><FileText className="h-4 w-4"/>Generate Management Report</a></Button>
    </CardContent></Card>
    <Card><CardHeader><div className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5"/><CardTitle>Report Settings & Data Export</CardTitle></div><CardDescription>Set the scope explicitly before creating the PDF or exporting source data.</CardDescription></CardHeader><CardContent className="space-y-4">
      <label className="grid gap-1.5 text-sm">Market<select className="h-10 rounded-md border bg-background px-3" value={marketId} onChange={(e)=>setMarketId(e.target.value)}>{markets.map(m=><option key={m.id} value={m.id}>{m.name} ({m.code})</option>)}</select></label>
      <label className="grid gap-1.5 text-sm">Initiative<select className="h-10 rounded-md border bg-background px-3" value={initiativeId} onChange={(e)=>setInitiativeId(e.target.value)}>{initiatives.map(i=><option key={i.id} value={i.id}>{i.code} — {i.name}</option>)}</select></label>
      <label className="grid gap-1.5 text-sm">Time window<select className="h-10 rounded-md border bg-background px-3" value={weeks} onChange={(e)=>setWeeks(e.target.value)}><option value="2">Last 2 weeks</option><option value="4">Last 4 weeks</option><option value="6">Last 6 weeks</option><option value="12">Last 12 weeks</option><option value="26">Last 6 months</option><option value="52">Last 12 months</option></select></label>
      <Button asChild className="w-full bg-[#78FAAE] text-[#0E3A2F] hover:bg-[#63e89a]"><a href={managementUrl}><FileText className="h-4 w-4"/>Generate Management Report</a></Button>
      <Button asChild variant="outline" className="w-full"><a href={downloadUrl}><Download className="h-4 w-4"/>Download CSV</a></Button>
    </CardContent></Card>
  </div>;
}

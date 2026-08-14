"use client";

import { useRef, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Initiative = { id: string; code: string; name: string };

export function InitiativeFileUpload({ initiatives }: { initiatives: Initiative[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [initiativeId, setInitiativeId] = useState(initiatives[0]?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    setUploading(true); setMessage(""); setError("");
    try {
      const form = new FormData(); form.append("file", file); form.append("initiativeId", initiativeId);
      const response = await fetch("/api/initiative-files", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      setMessage(`${result.fileName} uploaded to ${result.initiative}.`);
    } catch (err) { setError(err instanceof Error ? err.message : "Upload failed."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  return <div className="mb-6 rounded-xl border bg-card p-4">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="font-medium">Initiative files</p><p className="text-sm text-muted-foreground">Owners can add presentations, spreadsheets, PDFs and supporting project files.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <select className="h-10 min-w-52 rounded-md border bg-background px-3 text-sm" value={initiativeId} onChange={(e)=>setInitiativeId(e.target.value)}>{initiatives.map(i=><option key={i.id} value={i.id}>{i.code} — {i.name}</option>)}</select>
        <input ref={inputRef} type="file" className="hidden" accept=".ppt,.pptx,.xls,.xlsx,.csv,.pdf,.doc,.docx,.txt,.zip" onChange={(e)=>{const file=e.target.files?.[0]; if(file) uploadFile(file)}} />
        <Button type="button" onClick={()=>inputRef.current?.click()} disabled={uploading || !initiativeId} className="bg-[#78FAAE] text-[#0E3A2F] hover:bg-[#78FAAE]/90">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Upload className="h-4 w-4"/>}{uploading ? "Uploading..." : "Upload file"}
        </Button>
      </div>
    </div>
    {message && <p className="mt-3 flex items-center gap-1.5 text-sm text-green-700"><Check className="h-4 w-4"/>{message}</p>}
    {error && <p role="alert" className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <p className="mt-2 text-xs text-muted-foreground">Accepted: PowerPoint, Excel/CSV, PDF, Word, TXT and ZIP. Max. 25 MB.</p>
  </div>;
}

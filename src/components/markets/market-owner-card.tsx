"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function MarketOwnerCard({ marketId, owner }: { marketId: string; owner: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(owner);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    if (!value.trim()) return;
    setSaving(true);
    setError("");
    const response = await fetch(`/api/markets/${marketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead: value.trim() }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error ?? "Could not update market owner.");
      setSaving(false);
      return;
    }
    setSaving(false);
    setEditing(false);
    router.refresh();
  }

  return <Card className="h-full"><CardContent className="p-3">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-muted-foreground">Market Owner</p>
      <button type="button" onClick={() => { setEditing((v) => !v); setValue(owner); setError(""); }} className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-secondary" aria-label="Edit market owner" title="Edit market owner">
        {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
      </button>
    </div>
    {editing ? <div className="mt-2 flex gap-2">
      <input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(); }} autoFocus className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
      <Button size="sm" className="h-8 bg-[#78FAAE] px-3 text-[#0D3B32] hover:bg-[#78FAAE]/90" onClick={save} disabled={saving || !value.trim()}>{saving ? "..." : "Save"}</Button>
    </div> : <p className="mt-1.5 text-sm font-semibold">{owner}</p>}
    {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
  </CardContent></Card>;
}

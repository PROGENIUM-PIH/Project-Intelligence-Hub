"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateInitiativeKeyKpis } from "@/lib/actions/initiatives";

export function InitiativeKeyKpis({initiativeId,value}:{initiativeId:string;value:string|null}){
 const [text,setText]=useState(value??"");const [saving,setSaving]=useState(false);const [saved,setSaved]=useState(false);
 async function save(){setSaving(true);setSaved(false);try{await updateInitiativeKeyKpis(initiativeId,text);setSaved(true);setTimeout(()=>setSaved(false),1800);}finally{setSaving(false)}}
 return <div className="space-y-3"><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Key KPIs that measure the effect of the initiative after implementation" className="min-h-36 w-full resize-y rounded-md border bg-background p-3 text-sm placeholder:text-muted-foreground"/><div className="flex items-center justify-end gap-2">{saved?<span className="text-xs text-muted-foreground">Saved</span>:null}<Button type="button" size="sm" onClick={save} disabled={saving}>{saving?"Saving...":"Save"}</Button></div></div>
}

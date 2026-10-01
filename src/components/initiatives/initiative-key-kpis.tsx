"use client";
import { useEffect, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateInitiativeKeyKpis } from "@/lib/actions/initiatives";

function parseKpis(value:string|null){return (value??"").split("\n").map(v=>v.trim()).filter(Boolean)}

export function InitiativeKeyKpis({initiativeId,value}:{initiativeId:string;value:string|null}){
 const [items,setItems]=useState(()=>parseKpis(value));const [draft,setDraft]=useState("");const [editing,setEditing]=useState<number|null>(null);const [editText,setEditText]=useState("");const [saving,setSaving]=useState(false);
 useEffect(()=>setItems(parseKpis(value)),[value]);
 async function persist(next:string[]){setSaving(true);try{await updateInitiativeKeyKpis(initiativeId,next.join("\n"));setItems(next)}finally{setSaving(false)}}
 async function add(){const text=draft.trim();if(!text)return;setDraft("");await persist([...items,text])}
 async function remove(index:number){await persist(items.filter((_,i)=>i!==index))}
 async function saveEdit(index:number){const text=editText.trim();if(!text)return;const next=items.map((v,i)=>i===index?text:v);setEditing(null);await persist(next)}
 return <div className="space-y-4">
   <div className="flex items-end gap-2"><label className="grid flex-1 gap-1.5 text-sm"><span className="sr-only">Add KPI</span><textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Key KPIs that measure the effect of the initiative after implementation" className="min-h-20 w-full resize-y rounded-md border bg-background p-3 text-sm placeholder:text-muted-foreground"/></label><Button type="button" size="sm" onClick={add} disabled={!draft.trim()||saving}><Plus className="h-4 w-4"/>Add</Button></div>
   <div className="space-y-2">{items.length===0?<p className="text-sm text-muted-foreground">No Key KPIs added yet.</p>:items.map((item,index)=><div key={index} className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">{editing===index?<><input autoFocus value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit(index);if(e.key==="Escape")setEditing(null)}} className="h-9 flex-1 rounded-md border bg-background px-3 text-sm"/><button type="button" onClick={()=>saveEdit(index)} disabled={saving} className="rounded-md p-2 hover:bg-secondary" aria-label="Save KPI"><Check className="h-4 w-4"/></button><button type="button" onClick={()=>setEditing(null)} className="rounded-md p-2 hover:bg-secondary" aria-label="Cancel"><X className="h-4 w-4"/></button></>:<><span className="flex-1 text-sm">{item}</span><button type="button" onClick={()=>{setEditing(index);setEditText(item)}} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Edit KPI"><Pencil className="h-4 w-4"/></button><button type="button" onClick={()=>remove(index)} disabled={saving} className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label="Delete KPI"><Trash2 className="h-4 w-4"/></button></>}</div>)}</div>
 </div>
}

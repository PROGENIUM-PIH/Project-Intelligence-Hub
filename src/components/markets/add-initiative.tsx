"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { linkExistingInitiative } from "@/lib/actions/market-initiatives";

type InitiativeOption={id:string;code:string|null;name:string};
export function AddInitiative({marketId,initiatives}:{marketId:string;initiatives:InitiativeOption[]}){
 const router=useRouter();const[open,setOpen]=useState(false);const[saving,setSaving]=useState(false);const[error,setError]=useState("");
 async function submit(fd:FormData){setSaving(true);setError("");try{await linkExistingInitiative(marketId,String(fd.get("initiativeId")||""),String(fd.get("localLead")||"TBD"));setOpen(false);router.refresh()}catch{setError("Could not link initiative.")}finally{setSaving(false)}}
 return <><Button size="sm" onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/>Add Initiative</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Add Existing Initiative</DialogTitle></DialogHeader><form action={submit} className="space-y-3"><label className="block text-sm font-medium">Initiative<select name="initiativeId" required defaultValue="" className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm"><option value="" disabled>Select initiative...</option>{initiatives.map(i=><option key={i.id} value={i.id}>{i.code?i.code+" · ":""}{i.name}</option>)}</select></label><Input name="localLead" placeholder="Local lead (optional)"/>{error?<p className="text-sm text-destructive">{error}</p>:null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><Button disabled={saving||initiatives.length===0}>{saving?"Linking...":"Add to Market"}</Button></div></form></DialogContent></Dialog></>
}
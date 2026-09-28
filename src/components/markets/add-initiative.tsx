"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createMarketInitiative } from "@/lib/actions/initiatives";

export function AddInitiative({marketId}:{marketId:string}){
 const router=useRouter();const[open,setOpen]=useState(false);const[saving,setSaving]=useState(false);const[error,setError]=useState("");
 async function submit(fd:FormData){setSaving(true);setError("");try{await createMarketInitiative(marketId,{code:String(fd.get("code")||""),name:String(fd.get("name")||""),description:String(fd.get("description")||""),owner:String(fd.get("owner")||""),localLead:String(fd.get("localLead")||"TBD"),targetDate:String(fd.get("targetDate")||"")});setOpen(false);router.refresh()}catch{setError("Could not create initiative. Check that the code is unique.")}finally{setSaving(false)}}
 return <><Button size="sm" onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/>Add Initiative</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Add Initiative</DialogTitle></DialogHeader><form action={submit} className="space-y-3"><div className="grid grid-cols-2 gap-3"><Input name="code" placeholder="ID / Code" required/><Input name="name" placeholder="Initiative name" required/></div><Input name="owner" placeholder="HQ owner" required/><Input name="localLead" placeholder="Local lead"/><Input name="targetDate" type="date" required/><textarea name="description" placeholder="Description" required className="min-h-24 w-full rounded-md border bg-background p-3 text-sm"/>{error?<p className="text-sm text-destructive">{error}</p>:null}<div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><Button disabled={saving}>{saving?"Creating...":"Create & link"}</Button></div></form></DialogContent></Dialog></>
}

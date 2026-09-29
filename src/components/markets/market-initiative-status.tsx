"use client";
import { useState,useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2,MessageSquare,Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { updateMarketInitiativeRollout,updateMarketInitiativeComment } from "@/lib/actions/market-initiatives";

// Rollout stage comments keep an immutable history in the database.
const labels:Record<string,string>={NO_INTEREST_YET:"No interest yet",REJECTED:"Rejected",INTERESTED:"Interested",IN_EVALUATION:"In Evaluation",PILOTING:"Piloting",IMPLEMENTATION_AGREED:"Implementation Agreed",MEASURE_IN_PLACE:"Measure in Place"};
type HistoryItem={id:string;rolloutStage:string;comment:string;createdAt:Date|string};
export function MarketInitiativeStatus({linkId,value,comment,history=[]}:{linkId:string;value:string;comment?:string|null;history?:HistoryItem[]}){
 const router=useRouter();const [pending,start]=useTransition();const [open,setOpen]=useState(false);const [text,setText]=useState(comment??"");
 return <div className="flex items-center gap-2"><select value={value} disabled={pending} onChange={e=>{const next=e.target.value;start(async()=>{await updateMarketInitiativeRollout(linkId,next)})}} className="h-9 rounded-md border bg-background px-2 text-xs font-medium" aria-label="Market rollout stage">{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
 <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={()=>setOpen(true)} title={comment?"Edit comment":"Add comment"}><MessageSquare className="h-4 w-4"/></Button>{pending?<Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>:null}
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>Status Comment · {labels[value]??value}</DialogTitle></DialogHeader>
 <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Explain the current rollout stage..." className="min-h-28 rounded-md border bg-background p-3 text-sm"/>
 <div className="flex justify-between"><Button type="button" variant="outline" disabled={!text&&!comment} onClick={()=>start(async()=>{await updateMarketInitiativeComment(linkId,"");setText("");router.refresh()})}><Trash2 className="h-4 w-4"/>Delete current</Button><Button type="button" onClick={()=>start(async()=>{await updateMarketInitiativeComment(linkId,text);router.refresh()})}>Save Comment</Button></div>
 <div className="border-t pt-4"><h4 className="mb-3 text-sm font-semibold">Comment History</h4>{history.length===0?<p className="text-sm text-muted-foreground">No previous comments yet.</p>:<div className="space-y-3">{history.map(item=><div key={item.id} className="rounded-lg border p-3"><div className="mb-1 flex flex-wrap items-center justify-between gap-2"><span className="text-xs font-medium">{labels[item.rolloutStage]??item.rolloutStage}</span><span className="text-[11px] text-muted-foreground">{new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short"}).format(new Date(item.createdAt))}</span></div><p className="whitespace-pre-wrap text-sm">{item.comment}</p></div>)}</div>}</div>
 </DialogContent></Dialog></div>
}

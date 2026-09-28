"use client";
import { useState,useTransition } from "react";
import { Loader2,MessageSquare,Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { updateMarketInitiativeRollout,updateMarketInitiativeComment } from "@/lib/actions/market-initiatives";

const labels:Record<string,string>={NO_INTEREST_YET:"No interest yet",REJECTED:"Rejected",INTERESTED:"Interested",IN_EVALUATION:"In Evaluation",PILOTING:"Piloting",IMPLEMENTATION_AGREED:"Implementation Agreed",MEASURE_IN_PLACE:"Measure in Place"};
export function MarketInitiativeStatus({linkId,value,comment}:{linkId:string;value:string;comment?:string|null}){
 const [pending,start]=useTransition();const [open,setOpen]=useState(false);const [text,setText]=useState(comment??"");
 return <div className="flex items-center gap-2"><select value={value} disabled={pending} onChange={e=>{const next=e.target.value;start(async()=>{await updateMarketInitiativeRollout(linkId,next)})}} className="h-9 rounded-md border bg-background px-2 text-xs font-medium" aria-label="Market rollout stage">{Object.entries(labels).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>
 <Button type="button" variant="outline" size="icon" className="h-9 w-9" onClick={()=>setOpen(true)} title={comment?"Edit comment":"Add comment"}><MessageSquare className="h-4 w-4"/></Button>{pending?<Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>:null}
 <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Status Comment · {labels[value]??value}</DialogTitle></DialogHeader><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Explain the current rollout stage..." className="min-h-32 rounded-md border bg-background p-3 text-sm"/><div className="flex justify-between"><Button type="button" variant="outline" disabled={!text&&!comment} onClick={()=>start(async()=>{await updateMarketInitiativeComment(linkId,"");setText("");setOpen(false)})}><Trash2 className="h-4 w-4"/>Delete</Button><Button type="button" onClick={()=>start(async()=>{await updateMarketInitiativeComment(linkId,text);setOpen(false)})}>Save Comment</Button></div></DialogContent></Dialog></div>
}

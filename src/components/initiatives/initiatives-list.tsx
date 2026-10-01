"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {Search} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Card,CardContent,CardHeader} from "@/components/ui/card";

type Initiative={id:string;code:string|null;name:string;owner:string;description:string;stage:string;targetLabel:string;markets:{id:string;code:string}[]};
const stageLabel:Record<string,string>={IDEATION:"Ideation",EVALUATION:"Evaluation",DETAILING:"Detailing",DEVELOPMENT:"Development",ROLLOUT:"Rollout"};
export function InitiativesList({initiatives}:{initiatives:Initiative[]}){
 const[q,setQ]=useState("");const[stage,setStage]=useState("ALL");
 const filtered=useMemo(()=>initiatives.filter(i=>{const text=`${i.code??""} ${i.name} ${i.owner}`.toLowerCase();return text.includes(q.trim().toLowerCase())&&(stage==="ALL"||i.stage===stage)}),[initiatives,q,stage]);
 return <><div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search initiatives by name, ID / code or owner..." className="pl-9"/></div><select value={stage} onChange={e=>setStage(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="ALL">All stages</option>{Object.entries(stageLabel).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
 <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{filtered.map(i=><Link key={i.id} href={`/initiatives/${i.id}`} className="group block h-full"><Card className="pih-entity-card h-full transition-shadow hover:shadow-md"><CardHeader className="flex flex-row items-start justify-between gap-3"><div><p className="text-xs font-medium text-muted-foreground">{i.code?`${i.code} · `:""}Owner: {i.owner}</p><p className="text-base font-semibold text-foreground">{i.name}</p></div><span className="rounded-full bg-[#78FAAE]/15 px-2.5 py-1 text-xs font-semibold text-[#0D3B32]">{stageLabel[i.stage]??i.stage}</span></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">{i.description}</p><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>{i.targetLabel}</span><div className="flex flex-wrap gap-1.5">{i.markets.map(m=><span key={m.id} className="rounded-full bg-secondary px-2 py-0.5 text-secondary-foreground">{m.code}</span>)}</div></div></CardContent></Card></Link>)}</div>{filtered.length===0?<p className="py-10 text-center text-sm text-muted-foreground">No initiatives match your search.</p>:null}</>
}
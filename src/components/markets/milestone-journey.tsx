"use client";

import { useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";

const milestones = [
  "Onboarding Session",
  "1:1 Session / Follow up",
  "Implementation Plan aligned",
  "Implementation started",
  "Implementation done",
] as const;

type Props = { marketId:string; marketName:string; autoCompleted?:number; savedCompleted?:number };

export function MilestoneJourney({marketId,marketName,autoCompleted=0,savedCompleted=0}:Props){
  const initialCompleted=savedCompleted>0?savedCompleted:autoCompleted;
  const [completed,setCompleted]=useState(Math.min(Math.max(initialCompleted,0),milestones.length));
  const [saving,setSaving]=useState(false); const [error,setError]=useState("");
  const currentIndex=completed>=milestones.length?milestones.length-1:completed;
  const currentLabel=milestones[currentIndex];
  const progress=Math.round((completed/milestones.length)*100);

  const saveCompleted=async(value:number)=>{const next=Math.min(Math.max(value,0),milestones.length);const previous=completed;setCompleted(next);setSaving(true);setError("");try{const response=await fetch(`/api/markets/${marketId}/milestones`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({completed:next})});if(!response.ok)throw new Error("Unable to save milestone progress.")}catch(err){setCompleted(previous);setError(err instanceof Error?err.message:"Unable to save milestone progress.")}finally{setSaving(false)}};
  const sourceText=useMemo(()=>autoCompleted>0?`${autoCompleted} milestone${autoCompleted>1?"s":""} suggested from market meetings`:"No meeting-based milestone suggestion",[autoCompleted]);

  return <div className="rounded-xl border p-4">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold">{marketName}</p><p className="mt-1 text-xs text-muted-foreground">Current milestone: <span className="font-medium text-foreground">{currentLabel}</span> · {completed}/5 · {progress}%</p></div><span className="rounded-full bg-[#78FAAE] px-2.5 py-1 text-[11px] font-semibold text-[#0E3A2F]">{completed>=5?"Complete":"In progress"}</span></div>
    <div className="mt-5 grid grid-cols-5 gap-1">
      {milestones.map((label,index)=>{const done=completed>=milestones.length?index<currentIndex:index<completed;const current=index===currentIndex;return <button disabled={saving} key={label} type="button" onClick={()=>saveCompleted(current?index+1:index)} className="group text-left disabled:cursor-wait" title={current?`Complete ${label} and move forward`:`Make ${label} the current milestone`}>
        <div className={`mb-2 h-2 rounded-full border transition-all duration-200 ${current?"border-[#78FAAE] bg-[#78FAAE] ring-2 ring-[#78FAAE]/35":done?"border-[#0E3A2F] bg-[#0E3A2F]":"border-[#C9D1CD] bg-[#E3E9E6]"}`}/>
        <div className={`text-[10px] leading-4 transition-colors ${current?"font-bold text-[#0E3A2F]":done?"font-semibold text-[#0E3A2F]":"text-muted-foreground"}`}>{done&&<Check className="mr-1 inline h-3 w-3"/>}{label}</div>
      </button>})}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3"><p className="text-[11px] text-muted-foreground">{sourceText}. Meeting detection is a suggestion only and never locks progress. <strong>Electric green = current.</strong> Emerald + ✓ = completed. Grey = upcoming. Click any milestone to move the current position forward or backward.</p>{saving&&<span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin"/>Saving…</span>}</div>
    {error&&<p className="mt-2 text-xs text-destructive">{error}</p>}
  </div>;
}

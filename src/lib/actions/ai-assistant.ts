"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { healthTone, taskStatusTone, riskSeverityTone, riskStatusTone } from "@/lib/status";

export type ProposedUpdate = {
  entityType: "Task" | "Risk" | "Initiative" | "Market";
  entityId: string;
  entityLabel: string;
  field: string;
  fieldLabel: string;
  currentValue: string;
  currentValueLabel: string;
  proposedValue: string;
  proposedValueLabel: string;
};
export type ProposalResult = { ok: true; proposal: ProposedUpdate } | { ok: false; message: string };

const HEALTH_KEYWORDS: [string,string][] = [["back on track","ON_TRACK"],["on track","ON_TRACK"],["at risk","AT_RISK"],["critical","CRITICAL"]];
const TASK_STATUS_KEYWORDS: [string,string][] = [["not started","TODO"],["to do","TODO"],["todo","TODO"],["in progress","IN_PROGRESS"],["started","IN_PROGRESS"],["blocked","BLOCKED"],["completed","DONE"],["complete","DONE"],["finished","DONE"],["done","DONE"]];
const RISK_STATUS_KEYWORDS: [string,string][] = [["mitigated","MITIGATED"],["resolved","CLOSED"],["closed","CLOSED"],["open","OPEN"]];
const RISK_SEVERITY_KEYWORDS: [string,string][] = [["low severity","LOW"],["medium severity","MEDIUM"],["high severity","HIGH"],["critical severity","CRITICAL"],["low","LOW"],["medium","MEDIUM"],["high","HIGH"],["critical","CRITICAL"]];
const STOPWORDS = new Set(["the","a","an","to","for","and","of","in","on","as","is","set","mark","make","please","change","update","status","task","risk","initiative","market","with","that","this","now"]);
function normalizeWords(text:string){return text.toLowerCase().replace(/[^a-z0-9čšřáíéžýůú\s]/gi," ").split(/\s+/).filter(w=>w.length>=3&&!STOPWORDS.has(w));}
function bestMatch<T extends {id:string;label:string}>(text:string,candidates:T[]){const lower=text.toLowerCase();const words=new Set(normalizeWords(text));let best:{candidate:T;score:number}|null=null;for(const candidate of candidates){const label=candidate.label.toLowerCase();let score=lower.includes(label)?1:0;if(!score){const c=normalizeWords(candidate.label);score=c.length?c.filter(w=>words.has(w)).length/c.length:0;}if(score>0&&(!best||score>best.score))best={candidate,score};}return best&&best.score>=0.34?best:null;}
function findKeyword(text:string,dict:[string,string][]){const lower=text.toLowerCase();for(const [phrase,value] of dict)if(lower.includes(phrase))return value;return null;}

export async function proposeUpdate(text:string):Promise<ProposalResult>{
 const trimmed=text.trim(); if(trimmed.length<6)return{ok:false,message:"Describe the update in a bit more detail."};
 const lower=trimmed.toLowerCase(), mentionsTask=lower.includes("task"), mentionsRisk=lower.includes("risk"), mentionsMarket=lower.includes("market"), mentionsInitiative=lower.includes("initiative");
 const taskStatus=findKeyword(trimmed,TASK_STATUS_KEYWORDS),riskStatus=findKeyword(trimmed,RISK_STATUS_KEYWORDS),health=findKeyword(trimmed,HEALTH_KEYWORDS),riskSeverity=mentionsRisk?findKeyword(trimmed,RISK_SEVERITY_KEYWORDS):null;
 if(mentionsTask||(taskStatus&&!mentionsRisk&&!mentionsMarket&&!mentionsInitiative)){if(!taskStatus)return{ok:false,message:'Could not tell what task status you want. Try "to do", "in progress", "done", or "blocked".'};const tasks=await prisma.task.findMany({select:{id:true,title:true,status:true}});const match=bestMatch(trimmed,tasks.map(t=>({id:t.id,label:t.title,status:t.status})));if(!match)return{ok:false,message:"Could not find a matching task. Try including more of its title."};return{ok:true,proposal:{entityType:"Task",entityId:match.candidate.id,entityLabel:match.candidate.label,field:"status",fieldLabel:"Status",currentValue:match.candidate.status,currentValueLabel:taskStatusTone(match.candidate.status).label,proposedValue:taskStatus,proposedValueLabel:taskStatusTone(taskStatus).label}};}
 if(mentionsRisk&&(riskStatus||riskSeverity)){const risks=await prisma.risk.findMany({select:{id:true,title:true,status:true,severity:true}});const match=bestMatch(trimmed,risks.map(r=>({id:r.id,label:r.title,status:r.status,severity:r.severity})));if(!match)return{ok:false,message:"Could not find a matching risk. Try including more of its title."};if(riskStatus)return{ok:true,proposal:{entityType:"Risk",entityId:match.candidate.id,entityLabel:match.candidate.label,field:"status",fieldLabel:"Status",currentValue:match.candidate.status,currentValueLabel:riskStatusTone(match.candidate.status).label,proposedValue:riskStatus,proposedValueLabel:riskStatusTone(riskStatus).label}};return{ok:true,proposal:{entityType:"Risk",entityId:match.candidate.id,entityLabel:match.candidate.label,field:"severity",fieldLabel:"Severity",currentValue:match.candidate.severity,currentValueLabel:riskSeverityTone(match.candidate.severity).label,proposedValue:riskSeverity!,proposedValueLabel:riskSeverityTone(riskSeverity!).label}};}
 if(health&&(mentionsMarket||mentionsInitiative||!mentionsTask)){
  if(mentionsMarket&&!mentionsInitiative){const markets=await prisma.market.findMany({select:{id:true,name:true,code:true,status:true}});const match=bestMatch(trimmed,markets.map(m=>({id:m.id,label:`${m.name} ${m.code}`,status:m.status})));if(!match)return{ok:false,message:"Could not find a matching market."};return{ok:true,proposal:{entityType:"Market",entityId:match.candidate.id,entityLabel:match.candidate.label,field:"status",fieldLabel:"Status",currentValue:match.candidate.status,currentValueLabel:healthTone(match.candidate.status).label,proposedValue:health,proposedValueLabel:healthTone(health).label}};}
  const initiatives=await prisma.initiative.findMany({select:{id:true,name:true,code:true,status:true}});const match=bestMatch(trimmed,initiatives.map(i=>({id:i.id,label:`${i.code} ${i.name}`,status:i.status})));if(match)return{ok:true,proposal:{entityType:"Initiative",entityId:match.candidate.id,entityLabel:match.candidate.label,field:"status",fieldLabel:"Status",currentValue:match.candidate.status,currentValueLabel:healthTone(match.candidate.status).label,proposedValue:health,proposedValueLabel:healthTone(health).label}};
  const markets=await prisma.market.findMany({select:{id:true,name:true,code:true,status:true}});const marketMatch=bestMatch(trimmed,markets.map(m=>({id:m.id,label:`${m.name} ${m.code}`,status:m.status})));if(marketMatch)return{ok:true,proposal:{entityType:"Market",entityId:marketMatch.candidate.id,entityLabel:marketMatch.candidate.label,field:"status",fieldLabel:"Status",currentValue:marketMatch.candidate.status,currentValueLabel:healthTone(marketMatch.candidate.status).label,proposedValue:health,proposedValueLabel:healthTone(health).label}};
  return{ok:false,message:"Could not find a matching market or initiative for that update."};
 }
 return{ok:false,message:'Could not understand that update. Try something like: "Mark task Finalize configurator UAT sign-off as done" or "Set Germany status to at risk".'};
}

export async function applyProposal(proposal:ProposedUpdate):Promise<{ok:true}>{
 const key=`${proposal.entityType}.${proposal.field}`;
 switch(key){
  case"Task.status":{const status=z.enum(["TODO","IN_PROGRESS","DONE","BLOCKED"]).parse(proposal.proposedValue);await prisma.task.update({where:{id:proposal.entityId},data:{status}});revalidatePath("/tasks");break;}
  case"Risk.status":{const status=z.enum(["OPEN","MITIGATED","CLOSED"]).parse(proposal.proposedValue);await prisma.risk.update({where:{id:proposal.entityId},data:{status}});revalidatePath("/risks");break;}
  case"Risk.severity":{const severity=z.enum(["LOW","MEDIUM","HIGH","CRITICAL"]).parse(proposal.proposedValue);await prisma.risk.update({where:{id:proposal.entityId},data:{severity}});revalidatePath("/risks");break;}
  case"Initiative.status":{const status=z.enum(["ON_TRACK","AT_RISK","CRITICAL"]).parse(proposal.proposedValue);await prisma.initiative.update({where:{id:proposal.entityId},data:{status}});revalidatePath("/initiatives");revalidatePath(`/initiatives/${proposal.entityId}`);break;}
  case"Market.status":{const status=z.enum(["ON_TRACK","AT_RISK","CRITICAL"]).parse(proposal.proposedValue);await prisma.market.update({where:{id:proposal.entityId},data:{status}});revalidatePath("/markets");revalidatePath(`/markets/${proposal.entityId}`);break;}
  default:throw new Error(`Unsupported update: ${key}`);
 }
 await prisma.activity.create({data:{type:"AI_ASSISTANT_UPDATE",description:`[Source: AI Command] ${proposal.entityLabel} — ${proposal.fieldLabel}: ${proposal.currentValueLabel} → ${proposal.proposedValueLabel}`,entityType:proposal.entityType,entityId:proposal.entityId,actor:"You (confirmed AI proposal)"}});
 revalidatePath("/dashboard");revalidatePath("/settings");revalidatePath("/updates");return{ok:true};
}

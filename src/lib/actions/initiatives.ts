"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const schema=z.object({code:z.string().trim().min(1),name:z.string().trim().min(1),description:z.string().trim().min(1),owner:z.string().trim().min(1),localLead:z.string().trim().default("TBD"),targetDate:z.string().min(1)});
export async function createMarketInitiative(marketId:string,input:z.infer<typeof schema>){
 const d=schema.parse(input);const market=await prisma.market.findUniqueOrThrow({where:{id:marketId},select:{id:true}});
 const initiative=await prisma.initiative.create({data:{code:d.code,name:d.name,description:d.description,owner:d.owner,startDate:new Date(),targetDate:new Date(d.targetDate),stage:"IDEATION",status:"ON_TRACK",markets:{create:{marketId:market.id,localLead:d.localLead||"TBD"}}}});
 revalidatePath(`/markets/${marketId}`);revalidatePath(`/initiatives/${initiative.id}`);revalidatePath("/initiatives");revalidatePath("/dashboard");return initiative;
}

const portfolioSchema=z.object({code:z.string().trim().optional().default(""),name:z.string().trim().min(1),description:z.string().trim().optional().default(""),owner:z.string().trim().min(1),status:z.enum(["ON_TRACK","AT_RISK","CRITICAL"]),stage:z.enum(["IDEATION","EVALUATION","DETAILING","DEVELOPMENT","ROLLOUT"]),startDate:z.string().optional().default(""),targetDate:z.string().optional().default("")});
const optionalDate=(value:string)=>value?new Date(value):null;
export async function createInitiative(input:z.infer<typeof portfolioSchema>){const d=portfolioSchema.parse(input);if(d.code){const existing=await prisma.initiative.findUnique({where:{code:d.code},select:{id:true}});if(existing)throw new Error(`Initiative code ${d.code} already exists. Please choose another ID / Code.`)}const initiative=await prisma.initiative.create({data:{code:d.code||null,name:d.name,description:d.description,owner:d.owner,status:d.status,stage:d.stage,startDate:optionalDate(d.startDate),targetDate:optionalDate(d.targetDate)}});revalidatePath("/initiatives");revalidatePath("/dashboard");return {ok:true,id:initiative.id} as const;}

export async function updateInitiative(id:string,input:z.infer<typeof portfolioSchema>){const d=portfolioSchema.parse(input);if(d.code){const existing=await prisma.initiative.findFirst({where:{code:d.code,NOT:{id}},select:{id:true}});if(existing)throw new Error(`Initiative code ${d.code} already exists. Please choose another ID / Code.`)}await prisma.initiative.update({where:{id},data:{code:d.code||null,name:d.name,description:d.description,owner:d.owner,status:d.status,stage:d.stage,startDate:optionalDate(d.startDate),targetDate:optionalDate(d.targetDate)}});revalidatePath(`/initiatives/${id}`);revalidatePath("/initiatives");revalidatePath("/dashboard");return {ok:true} as const;}

export async function updateInitiativeKeyKpis(id:string,keyKpis:string){await prisma.initiative.update({where:{id},data:{keyKpis:keyKpis.trim()||null}});revalidatePath(`/initiatives/${id}`);return {ok:true} as const;}

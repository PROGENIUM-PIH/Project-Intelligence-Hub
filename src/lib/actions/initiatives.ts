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

const portfolioSchema=z.object({code:z.string().trim().min(1),name:z.string().trim().min(1),description:z.string().trim().min(1),owner:z.string().trim().min(1),status:z.enum(["ON_TRACK","AT_RISK","CRITICAL"]),stage:z.enum(["IDEATION","EVALUATION","DETAILING","DEVELOPMENT","ROLLOUT"]),startDate:z.string().min(1),targetDate:z.string().min(1)});
export async function createInitiative(input:z.infer<typeof portfolioSchema>){const d=portfolioSchema.parse(input);const existing=await prisma.initiative.findUnique({where:{code:d.code},select:{id:true}});if(existing)return {ok:false,error:`Initiative code ${d.code} already exists. Please choose another ID / Code.`} as const;const initiative=await prisma.initiative.create({data:{code:d.code,name:d.name,description:d.description,owner:d.owner,status:d.status,stage:d.stage,startDate:new Date(d.startDate),targetDate:new Date(d.targetDate)}});revalidatePath("/initiatives");revalidatePath("/dashboard");return {ok:true,id:initiative.id} as const;}

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

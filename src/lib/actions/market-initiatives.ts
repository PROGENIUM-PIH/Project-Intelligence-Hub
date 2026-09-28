"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const healthSchema = z.enum(["ON_TRACK","AT_RISK","CRITICAL"]);
const rolloutSchema = z.enum(["NO_INTEREST_YET","REJECTED","INTERESTED","IN_EVALUATION","PILOTING","IMPLEMENTATION_AGREED","MEASURE_IN_PLACE"]);

export async function recalculateMarketStatus(marketId:string){
  const links=await prisma.marketInitiative.findMany({where:{marketId},select:{localStatus:true}});
  if(!links.length)return null;
  const status=links.some(l=>l.localStatus==="CRITICAL")?"CRITICAL":links.some(l=>l.localStatus==="AT_RISK")?"AT_RISK":"ON_TRACK";
  await prisma.market.update({where:{id:marketId},data:{status}});
  return status;
}

async function refresh(link:{marketId:string;initiativeId:string}){revalidatePath(`/markets/${link.marketId}`);revalidatePath(`/initiatives/${link.initiativeId}`);revalidatePath("/markets");revalidatePath("/initiatives");revalidatePath("/dashboard")}

export async function updateMarketInitiativeStatus(linkId:string,status:string){
  const parsed=healthSchema.parse(status);const link=await prisma.marketInitiative.update({where:{id:linkId},data:{localStatus:parsed},select:{id:true,marketId:true,initiativeId:true}});
  await recalculateMarketStatus(link.marketId);await refresh(link);return {ok:true} as const;
}

export async function updateMarketInitiativeRollout(linkId:string,stage:string){
  const parsed=rolloutSchema.parse(stage);const link=await prisma.marketInitiative.update({where:{id:linkId},data:{rolloutStage:parsed},select:{marketId:true,initiativeId:true}});await refresh(link);return {ok:true} as const;
}

export async function updateMarketInitiativeComment(linkId:string,comment:string){
  const value=z.string().max(3000).parse(comment).trim();const link=await prisma.marketInitiative.update({where:{id:linkId},data:{statusComment:value||null},select:{marketId:true,initiativeId:true}});await refresh(link);return {ok:true} as const;
}

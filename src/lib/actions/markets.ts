"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const marketSchema=z.object({name:z.string().trim().min(1),code:z.string().trim().min(1),region:z.string().trim().min(1),lead:z.string().trim().optional().default(""),owner:z.enum(["Anna","Maja"]).optional()});
export async function createMarket(input:z.infer<typeof marketSchema>){const d=marketSchema.parse(input);const code=d.code.toUpperCase();const existing=await prisma.market.findUnique({where:{code},select:{id:true}});if(existing)throw new Error(`Market code ${code} already exists.`);await prisma.market.create({data:{...d,code,lead:d.lead||"TBD",owner:d.owner??null}});revalidatePath("/markets");revalidatePath("/dashboard");return {ok:true} as const;}
export async function updateMarket(id:string,input:z.infer<typeof marketSchema>){const d=marketSchema.parse(input);const code=d.code.toUpperCase();const existing=await prisma.market.findFirst({where:{code,NOT:{id}},select:{id:true}});if(existing)throw new Error(`Market code ${code} already exists.`);await prisma.market.update({where:{id},data:{...d,code,lead:d.lead||"TBD",owner:d.owner??null}});revalidatePath("/markets");revalidatePath(`/markets/${id}`);revalidatePath("/dashboard");return {ok:true} as const;}
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime="nodejs";
const allowed=["application/pdf","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/octet-stream"];

export async function POST(request:Request){
 try{
  const body=(await request.json()) as HandleUploadBody;
  const response=await handleUpload({
   body,request,
   onBeforeGenerateToken:async(pathname,clientPayload)=>{
    const payload=JSON.parse(clientPayload||"{}") as {marketId?:string;marketCode?:string;name?:string;size?:number;contentType?:string};
    if(!payload.marketId||!payload.name)throw new Error("Market and file are required.");
    const market=await prisma.market.findUnique({where:{id:payload.marketId},select:{id:true}});
    if(!market)throw new Error("Market not found.");
    return {allowedContentTypes:allowed,addRandomSuffix:true,tokenPayload:JSON.stringify(payload)};
   },
   onUploadCompleted:async({blob,tokenPayload})=>{
    const payload=JSON.parse(tokenPayload||"{}") as {marketId:string;name:string;size?:number;contentType?:string};
    await prisma.$transaction(async tx=>{
      await tx.document.deleteMany({where:{marketId:payload.marketId,category:"RISE_IMPLEMENTATION_PLAN"}});
      await tx.document.create({data:{name:payload.name,pathname:blob.pathname,blobUrl:blob.url,contentType:blob.contentType||payload.contentType||null,size:payload.size||0,category:"RISE_IMPLEMENTATION_PLAN",marketId:payload.marketId}});
    });
   }
  });
  return NextResponse.json(response);
 }catch(error){console.error("Implementation plan client upload failed",error);return NextResponse.json({error:error instanceof Error?error.message:"Upload failed."},{status:400})}
}

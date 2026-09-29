import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime="nodejs";
const allowed=["application/pdf","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml.presentation","application/vnd.ms-excel","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document","text/plain","application/octet-stream"];

export async function POST(request:Request){
 try{
  const body=(await request.json()) as HandleUploadBody;
  const response=await handleUpload({body,request,
   onBeforeGenerateToken:async(_pathname,clientPayload)=>{
    const payload=JSON.parse(clientPayload||"{}") as {contextType?:string;entityId?:string;name?:string;size?:number;contentType?:string};
    if(!payload.name||!["GENERAL","INITIATIVE"].includes(payload.contextType||""))throw new Error("Document assignment is required.");
    if(payload.contextType==="INITIATIVE"){
      if(!payload.entityId)throw new Error("Initiative is required.");
      const initiative=await prisma.initiative.findUnique({where:{id:payload.entityId},select:{id:true}});
      if(!initiative)throw new Error("Initiative not found.");
    }
    return {allowedContentTypes:allowed,addRandomSuffix:true,tokenPayload:JSON.stringify(payload)};
   },
   onUploadCompleted:async({blob,tokenPayload})=>{
    const payload=JSON.parse(tokenPayload||"{}") as {contextType:string;entityId?:string;name:string;size?:number;contentType?:string};
    await prisma.document.create({data:{name:payload.name,pathname:blob.pathname,blobUrl:blob.url,contentType:blob.contentType||payload.contentType||null,size:payload.size||0,category:payload.contextType==="GENERAL"?"GENERAL":null,initiativeId:payload.contextType==="INITIATIVE"?payload.entityId:null}});
   }
  });
  return NextResponse.json(response);
 }catch(error){console.error("Initiative input client upload failed",error);return NextResponse.json({error:error instanceof Error?error.message:"Upload failed."},{status:400})}
}

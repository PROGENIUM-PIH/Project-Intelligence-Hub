"use client";
import { ChangeEvent,useState } from "react";
import { Download,Loader2,UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Plan={id:string;name:string;pathname:string}|null;
const ACCEPTED=[".ppt",".pptx",".pdf",".xls",".xlsx",".doc",".docx"];

export function RiseImplementationPlan({market,plan}:{market:{id:string;code:string;name:string};plan:Plan}){
 const router=useRouter();const[file,setFile]=useState<File|null>(null);const[uploading,setUploading]=useState(false);const[error,setError]=useState("");
 function choose(e:ChangeEvent<HTMLInputElement>){const next=e.target.files?.[0]??null;if(next&&!ACCEPTED.some(x=>next.name.toLowerCase().endsWith(x))){setError("Unsupported file type.");setFile(null);return}setFile(next);setError("")}
 async function upload(){if(!file)return;setUploading(true);setError("");const form=new FormData();form.append("file",file);form.append("contextType","MARKET");form.append("contextCode",market.code);form.append("entityId",market.id);form.append("category","RISE_IMPLEMENTATION_PLAN");try{const res=await fetch("/api/documents/upload",{method:"POST",body:form});const raw=await res.text();let data:{error?:string}={};try{data=raw?JSON.parse(raw):{}}catch{}if(!res.ok)throw new Error(data.error||(res.status===413?"File is too large for direct upload. Please choose a smaller file.":`Upload failed (${res.status}).`));setFile(null);router.refresh()}catch(e){setError(e instanceof Error?e.message:"Upload failed.")}finally{setUploading(false)}}
 return <div className="rounded-lg border border-dashed p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">RISE Implementation Plan</p><p className="text-xs text-muted-foreground">{plan?plan.name:"No implementation plan uploaded yet."}</p></div><div className="flex items-center gap-2">{plan?<a href={`/api/documents/file?pathname=${encodeURIComponent(plan.pathname)}&download=1`}><Button type="button" variant="outline" size="sm"><Download className="h-4 w-4"/>Download</Button></a>:null}<label className="inline-flex cursor-pointer"><input type="file" className="sr-only" accept={ACCEPTED.join(",")} onChange={choose} disabled={uploading}/><span className="inline-flex h-9 items-center rounded-md bg-[#0E3A2F] px-3 text-sm font-medium text-white"><UploadCloud className="mr-2 h-4 w-4"/>{plan?"Replace Plan":"Upload Plan"}</span></label>{file?<Button type="button" size="sm" onClick={upload} disabled={uploading}>{uploading?<Loader2 className="h-4 w-4 animate-spin"/>:"Save"}</Button>:null}</div></div>{error?<p className="mt-2 text-xs text-destructive">{error}</p>:null}</div>
}

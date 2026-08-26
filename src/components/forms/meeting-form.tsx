"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMeeting, updateMeeting } from "@/lib/actions/meetings";

const formSchema = z.object({
  title: z.string(), date: z.string().min(1, "Date is required"), ap: z.string().optional(), notes: z.string().min(1, "Notes are required"), marketId: z.string().optional(), initiativeId: z.string().optional(),
}).refine(v => !!v.marketId || !!v.initiativeId, { message: "Select a market or initiative", path: ["marketId"] });
type FormValues=z.infer<typeof formSchema>;
type Option={id:string;code:string;name:string};
type Props={markets:Option[];initiatives:Option[];meeting?:{id:string;title:string;type:string;scope:string;date:Date;ap?:string|null;notes:string;marketId:string|null;initiativeId:string|null};onSuccess:()=>void};

export function MeetingForm({markets,initiatives,meeting,onSuccess}:Props){
 const [serverError,setServerError]=useState<string|null>(null);
 const {register,handleSubmit,formState:{errors,isSubmitting},setValue,watch}=useForm<FormValues>({resolver:zodResolver(formSchema),defaultValues:meeting?{title:meeting.title,date:format(meeting.date,"yyyy-MM-dd"),ap:meeting.ap??"",notes:meeting.notes,marketId:meeting.marketId??undefined,initiativeId:meeting.initiativeId??undefined}:{title:"Manual meeting",date:"",ap:"",notes:"",marketId:undefined,initiativeId:undefined}});
 const onSubmit=async(values:FormValues)=>{setServerError(null);try{const payload={...values,title:values.title.trim()||"Manual meeting",type:"OTHER" as const,scope:(values.initiativeId?"INITIATIVE":"MARKET") as "INITIATIVE"|"MARKET",date:new Date(values.date)};if(meeting)await updateMeeting(meeting.id,payload);else await createMeeting(payload);onSuccess();}catch{setServerError("Something went wrong. Please check the form and try again.")}};
 return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
  <div className="space-y-1.5"><Label htmlFor="date">Date</Label><Input id="date" type="date" {...register("date")}/>{errors.date&&<p className="text-xs text-destructive">{errors.date.message}</p>}</div>
  <div className="grid gap-4 sm:grid-cols-2">
   <div className="space-y-1.5"><Label>Market</Label><Select value={watch("marketId")} onValueChange={v=>setValue("marketId",v)}><SelectTrigger><SelectValue placeholder="Select market"/></SelectTrigger><SelectContent>{markets.map(m=><SelectItem key={m.id} value={m.id}>{m.code} · {m.name}</SelectItem>)}</SelectContent></Select>{errors.marketId&&<p className="text-xs text-destructive">{errors.marketId.message}</p>}</div>
   <div className="space-y-1.5"><Label>Initiative</Label><Select value={watch("initiativeId")} onValueChange={v=>setValue("initiativeId",v)}><SelectTrigger><SelectValue placeholder="Select initiative"/></SelectTrigger><SelectContent>{initiatives.map(i=><SelectItem key={i.id} value={i.id}>{i.code} · {i.name}</SelectItem>)}</SelectContent></Select></div>
  </div>
  <div className="space-y-1.5"><Label htmlFor="ap">AP</Label><Input id="ap" placeholder="Action point / responsible person" {...register("ap")}/></div>
  <div className="space-y-1.5"><Label htmlFor="notes">Notes</Label><Textarea id="notes" rows={6} placeholder="Enter meeting notes..." {...register("notes")}/>{errors.notes&&<p className="text-xs text-destructive">{errors.notes.message}</p>}</div>
  {serverError&&<p className="text-sm text-destructive">{serverError}</p>}
  <div className="flex justify-end pt-2"><Button type="submit" disabled={isSubmitting}>{meeting?"Save Changes":"Add Meeting"}</Button></div>
 </form>
}

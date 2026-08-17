"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, isBefore, startOfDay } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { Brain, CheckCircle2, Eye, FileUp, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { MeetingForm } from "@/components/forms/meeting-form";
import { CalendarImport } from "@/components/meetings/calendar-import";
import { meetingTypeLabel } from "@/lib/status";
import { deleteMeeting } from "@/lib/actions/meetings";

export type MeetingRow = { id:string; title:string; type:string; scope:string; date:Date; notes:string; marketId:string|null; initiativeId:string|null; market:{id:string;code:string;name:string}|null; initiative:{id:string;code:string;name:string}|null };
type Option={id:string;code:string;name:string};
type Tab="UPCOMING"|"PAST"|"REVIEW";

export function MeetingsClient({meetings,markets,initiatives}:{meetings:MeetingRow[];markets:Option[];initiatives:Option[]}){
 const router=useRouter(); const [tab,setTab]=useState<Tab>("UPCOMING"); const [search,setSearch]=useState(""); const [scopeFilter,setScopeFilter]=useState("ALL"); const [dialogOpen,setDialogOpen]=useState(false); const [editingMeeting,setEditingMeeting]=useState<MeetingRow|undefined>(); const [viewingMeeting,setViewingMeeting]=useState<MeetingRow|null>(null); const [deleteTarget,setDeleteTarget]=useState<MeetingRow|null>(null); const [importOpen,setImportOpen]=useState(false); const [reviewed,setReviewed]=useState<string[]>([]);
 const today=startOfDay(new Date());
 const filtered=useMemo(()=>meetings.filter(m=>{const past=isBefore(new Date(m.date),today); if(tab==="UPCOMING"&&past)return false;if(tab==="PAST"&&!past)return false;if(tab==="REVIEW"&&(!past||!m.notes?.trim()||reviewed.includes(m.id)))return false;return(scopeFilter==="ALL"||m.scope===scopeFilter)&&(!search||m.title.toLowerCase().includes(search.toLowerCase())||m.notes?.toLowerCase().includes(search.toLowerCase()));}),[meetings,scopeFilter,search,tab,reviewed]);
 const columns:ColumnDef<MeetingRow>[]=[
  {accessorKey:"title",header:"Meeting",cell:({row})=><button className="min-w-0 max-w-xs text-left" onClick={()=>setViewingMeeting(row.original)}><p className="truncate text-sm font-medium hover:underline">{row.original.title}</p><p className="text-xs text-muted-foreground">{meetingTypeLabel(row.original.type)}</p></button>},
  {id:"market",header:"Market",cell:({row})=><span className="text-sm">{row.original.market?.code||"—"}</span>},
  {id:"initiative",header:"Initiative",cell:({row})=><span className="text-sm">{row.original.initiative?.code||"—"}</span>},
  {accessorKey:"date",header:"Date",cell:({row})=><span className="text-sm text-muted-foreground">{format(new Date(row.original.date),"EEE, MMM d yyyy · HH:mm")}</span>},
  {id:"actions",header:"",enableSorting:false,cell:({row})=><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={()=>setViewingMeeting(row.original)}><Eye className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={()=>{setEditingMeeting(row.original);setDialogOpen(true)}}><Pencil className="h-4 w-4"/></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={()=>setDeleteTarget(row.original)}><Trash2 className="h-4 w-4"/></Button></div>}
 ];
 return <div>
  <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex rounded-lg border bg-background p-1">{(["UPCOMING","PAST","REVIEW"] as Tab[]).map(t=><Button key={t} size="sm" variant={tab===t?"default":"ghost"} onClick={()=>setTab(t)}>{t==="UPCOMING"?"Upcoming":t==="PAST"?"Past":"AI Review"}</Button>)}</div><div className="flex gap-2"><Button variant="outline" onClick={()=>setImportOpen(true)}><FileUp className="h-4 w-4"/>Import</Button><Button onClick={()=>{setEditingMeeting(undefined);setDialogOpen(true)}}><Plus className="h-4 w-4"/>Add Meeting</Button></div></div>
  <FilterBar className="mb-4"><SearchBar placeholder="Search meetings and minutes..." value={search} onChange={setSearch} className="w-full sm:w-64"/><Select value={scopeFilter} onValueChange={setScopeFilter}><SelectTrigger className="w-full sm:w-44"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="ALL">All scopes</SelectItem><SelectItem value="MARKET">Market</SelectItem><SelectItem value="INITIATIVE">Initiative</SelectItem></SelectContent></Select></FilterBar>
  {tab==="REVIEW"&&<div className="mb-4 rounded-xl border border-[#78FAAE] bg-[#78FAAE]/10 p-4"><div className="flex gap-3"><Brain className="mt-0.5 h-5 w-5"/><div><p className="font-semibold">Meeting Intelligence Review</p><p className="text-sm text-muted-foreground">Past meetings with minutes appear here. Review the extracted intelligence before it becomes project data.</p></div></div></div>}
  <DataTable columns={columns} data={filtered} emptyMessage={tab==="UPCOMING"?"No upcoming meetings.":tab==="PAST"?"No past meetings.":"No meeting minutes waiting for review."}/>
  <Dialog open={!!viewingMeeting} onOpenChange={o=>!o&&setViewingMeeting(null)}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{viewingMeeting?.title}</DialogTitle></DialogHeader>{viewingMeeting&&<div className="space-y-5"><div className="grid gap-3 rounded-lg border bg-secondary/30 p-4 text-sm sm:grid-cols-4"><div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{format(new Date(viewingMeeting.date),"MMM d, yyyy · HH:mm")}</p></div><div><p className="text-xs text-muted-foreground">Market</p><p className="font-medium">{viewingMeeting.market?.code||"—"}</p></div><div><p className="text-xs text-muted-foreground">Initiative</p><p className="font-medium">{viewingMeeting.initiative?.code||"—"}</p></div><div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{meetingTypeLabel(viewingMeeting.type)}</p></div></div><section><h3 className="mb-2 text-lg font-semibold">Meeting Minutes / Calendar Details</h3><div className="whitespace-pre-wrap rounded-lg border p-5 text-sm leading-6">{viewingMeeting.notes?.trim()||"No meeting minutes have been added yet."}</div></section>{viewingMeeting.notes?.trim()&&<section className="rounded-xl border border-[#78FAAE] bg-[#78FAAE]/10 p-5"><div className="mb-3 flex items-center gap-2"><Brain className="h-5 w-5"/><h3 className="font-semibold">AI Analysis — MVP preview</h3></div><p className="text-sm text-muted-foreground">Minutes are ready for extraction of decisions, actions, deadlines, risks and status changes. The next backend step will replace this preview with model-generated proposals.</p><div className="mt-4 flex gap-2"><Button onClick={()=>{setReviewed(x=>[...x,viewingMeeting.id]);setViewingMeeting(null)}}><CheckCircle2 className="h-4 w-4"/>Mark reviewed</Button><Button variant="outline" onClick={()=>{setViewingMeeting(null);setEditingMeeting(viewingMeeting);setDialogOpen(true)}}>Edit minutes</Button></div></section>}</div>}</DialogContent></Dialog>
  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingMeeting?"Edit Meeting":"Add Meeting"}</DialogTitle></DialogHeader><MeetingForm markets={markets} initiatives={initiatives} meeting={editingMeeting} onSuccess={()=>{setDialogOpen(false);router.refresh()}}/></DialogContent></Dialog>
  <Dialog open={importOpen} onOpenChange={setImportOpen}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl"><DialogHeader><DialogTitle>Import calendar meetings</DialogTitle></DialogHeader><CalendarImport markets={markets} initiatives={initiatives} onImported={()=>{setImportOpen(false);setTab("UPCOMING");router.refresh()}}/></DialogContent></Dialog>
  <ConfirmDeleteDialog open={!!deleteTarget} onOpenChange={o=>!o&&setDeleteTarget(null)} title="Delete meeting" description={`Are you sure you want to delete \"${deleteTarget?.title}\"? This cannot be undone.`} onConfirm={async()=>{if(!deleteTarget)return;await deleteMeeting(deleteTarget.id);setDeleteTarget(null);router.refresh()}}/>
 </div>
}

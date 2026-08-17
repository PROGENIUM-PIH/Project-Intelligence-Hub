"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { MeetingForm } from "@/components/forms/meeting-form";
import { meetingTypeLabel, meetingScopeLabel } from "@/lib/status";
import { deleteMeeting } from "@/lib/actions/meetings";

export type MeetingRow = {
  id: string; title: string; type: string; scope: string; date: Date; notes: string;
  marketId: string | null; initiativeId: string | null;
  market: { id: string; code: string; name: string } | null;
  initiative: { id: string; code: string; name: string } | null;
};
type Option = { id: string; code: string; name: string };

export function MeetingsClient({ meetings, markets, initiatives }: { meetings: MeetingRow[]; markets: Option[]; initiatives: Option[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingRow | undefined>();
  const [viewingMeeting, setViewingMeeting] = useState<MeetingRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MeetingRow | null>(null);
  const filtered = useMemo(() => meetings.filter((m) => (scopeFilter === "ALL" || m.scope === scopeFilter) && (!search || m.title.toLowerCase().includes(search.toLowerCase()) || m.notes?.toLowerCase().includes(search.toLowerCase()))), [meetings, scopeFilter, search]);

  const columns: ColumnDef<MeetingRow>[] = [
    { accessorKey: "title", header: "Meeting", cell: ({ row }) => <button className="min-w-0 max-w-xs text-left" onClick={() => setViewingMeeting(row.original)}><p className="truncate text-sm font-medium text-foreground hover:underline">{row.original.title}</p><p className="text-xs text-muted-foreground">{meetingTypeLabel(row.original.type)}</p></button> },
    { accessorKey: "scope", header: "Scope", cell: ({ row }) => { const m=row.original; const target=m.scope === "MARKET" ? m.market : m.initiative; return <span className="text-sm text-foreground">{meetingScopeLabel(m.scope)}{target ? <span className="text-muted-foreground"> · {target.code}</span> : null}</span>; } },
    { accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-sm text-muted-foreground">{format(row.original.date,"EEE, MMM d yyyy")}</span> },
    { id: "actions", header: "", enableSorting: false, cell: ({ row }) => <div className="flex justify-end gap-1"><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewingMeeting(row.original)} title="View meeting minutes"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingMeeting(row.original); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(row.original)}><Trash2 className="h-4 w-4" /></Button></div> },
  ];

  return <div>
    <FilterBar className="mb-4 justify-between"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><SearchBar placeholder="Search meetings and minutes..." value={search} onChange={setSearch} className="w-full sm:w-64"/><Select value={scopeFilter} onValueChange={setScopeFilter}><SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All scopes</SelectItem><SelectItem value="MARKET">Market</SelectItem><SelectItem value="INITIATIVE">Initiative</SelectItem></SelectContent></Select></div><Button onClick={() => { setEditingMeeting(undefined); setDialogOpen(true); }}><Plus className="h-4 w-4"/>Schedule Meeting</Button></FilterBar>
    <DataTable columns={columns} data={filtered} emptyMessage="No meetings match your filters." />

    <Dialog open={!!viewingMeeting} onOpenChange={(open) => !open && setViewingMeeting(null)}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{viewingMeeting?.title}</DialogTitle></DialogHeader>{viewingMeeting && <div className="space-y-5"><div className="grid gap-3 rounded-lg border bg-secondary/30 p-4 text-sm sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{format(viewingMeeting.date,"MMM d, yyyy")}</p></div><div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{meetingTypeLabel(viewingMeeting.type)}</p></div><div><p className="text-xs text-muted-foreground">Scope</p><p className="font-medium">{meetingScopeLabel(viewingMeeting.scope)}{(viewingMeeting.market || viewingMeeting.initiative) ? ` · ${(viewingMeeting.market || viewingMeeting.initiative)?.code}` : ""}</p></div></div><section><h3 className="mb-2 text-lg font-semibold">Meeting Minutes</h3><div className="whitespace-pre-wrap rounded-lg border bg-background p-5 text-sm leading-6">{viewingMeeting.notes?.trim() || "No meeting minutes have been added yet."}</div></section><div className="flex justify-end"><Button variant="outline" onClick={() => { setViewingMeeting(null); setEditingMeeting(viewingMeeting); setDialogOpen(true); }}><Pencil className="h-4 w-4"/>Edit Meeting Minutes</Button></div></div>}</DialogContent></Dialog>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>{editingMeeting ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle></DialogHeader><MeetingForm markets={markets} initiatives={initiatives} meeting={editingMeeting} onSuccess={() => { setDialogOpen(false); router.refresh(); }} /></DialogContent></Dialog>
    <ConfirmDeleteDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)} title="Delete meeting" description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`} onConfirm={async () => { if (!deleteTarget) return; await deleteMeeting(deleteTarget.id); setDeleteTarget(null); router.refresh(); }} />
  </div>;
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar } from "@/components/shared/filter-bar";
import { SearchBar } from "@/components/shared/search-bar";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { MeetingForm } from "@/components/forms/meeting-form";
import { meetingTypeLabel, meetingScopeLabel } from "@/lib/status";
import { deleteMeeting } from "@/lib/actions/meetings";

export type MeetingRow = {
  id: string;
  title: string;
  type: string;
  scope: string;
  date: Date;
  notes: string;
  marketId: string | null;
  initiativeId: string | null;
  market: { id: string; code: string; name: string } | null;
  initiative: { id: string; code: string; name: string } | null;
};

type Option = { id: string; code: string; name: string };

export function MeetingsClient({
  meetings,
  markets,
  initiatives,
}: {
  meetings: MeetingRow[];
  markets: Option[];
  initiatives: Option[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<MeetingRow | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<MeetingRow | null>(null);

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      if (scopeFilter !== "ALL" && m.scope !== scopeFilter) return false;
      if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [meetings, scopeFilter, search]);

  const columns: ColumnDef<MeetingRow>[] = [
    {
      accessorKey: "title",
      header: "Meeting",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-xs">
          <p className="truncate text-sm font-medium text-foreground">
            {row.original.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {meetingTypeLabel(row.original.type)}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "scope",
      header: "Scope",
      cell: ({ row }) => {
        const m = row.original;
        const target = m.scope === "MARKET" ? m.market : m.initiative;
        return (
          <span className="text-sm text-foreground">
            {meetingScopeLabel(m.scope)}
            {target ? (
              <span className="text-muted-foreground"> · {target.code}</span>
            ) : null}
          </span>
        );
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(row.original.date, "EEE, MMM d yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => {
              setEditingMeeting(row.original);
              setDialogOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <FilterBar className="mb-4 justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            placeholder="Search meetings..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-64"
          />
          <Select value={scopeFilter} onValueChange={setScopeFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All scopes</SelectItem>
              <SelectItem value="MARKET">Market</SelectItem>
              <SelectItem value="INITIATIVE">Initiative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingMeeting(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </Button>
      </FilterBar>

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No meetings match your filters."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMeeting ? "Edit Meeting" : "Schedule Meeting"}</DialogTitle>
          </DialogHeader>
          <MeetingForm
            markets={markets}
            initiatives={initiatives}
            meeting={editingMeeting}
            onSuccess={() => {
              setDialogOpen(false);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete meeting"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteMeeting(deleteTarget.id);
          setDeleteTarget(null);
          router.refresh();
        }}
      />
    </div>
  );
}

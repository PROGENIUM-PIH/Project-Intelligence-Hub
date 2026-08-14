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
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { RiskForm } from "@/components/forms/risk-form";
import { riskSeverityTone, riskStatusTone } from "@/lib/status";
import { deleteRisk } from "@/lib/actions/risks";

export type RiskRow = {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  owner: string;
  identifiedDate: Date;
  initiativeId: string;
  initiative: { id: string; code: string; name: string };
};

type InitiativeOption = { id: string; code: string; name: string };

export function RisksClient({
  risks,
  initiatives,
}: {
  risks: RiskRow[];
  initiatives: InitiativeOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskRow | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<RiskRow | null>(null);

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (severityFilter !== "ALL" && r.severity !== severityFilter) return false;
      if (statusFilter !== "ALL" && r.status !== statusFilter) return false;
      if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [risks, severityFilter, statusFilter, search]);

  const columns: ColumnDef<RiskRow>[] = [
    {
      accessorKey: "title",
      header: "Risk",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-xs">
          <p className="truncate text-sm font-medium text-foreground">
            {row.original.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.original.initiative.code} · {row.original.initiative.name}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "owner",
      header: "Owner",
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.owner}</span>
      ),
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const t = riskSeverityTone(row.original.severity);
        return <StatusBadge label={t.label} tone={t.tone} />;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const t = riskStatusTone(row.original.status);
        return <StatusBadge label={t.label} tone={t.tone} />;
      },
    },
    {
      accessorKey: "identifiedDate",
      header: "Identified",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(row.original.identifiedDate, "MMM d, yyyy")}
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
              setEditingRisk(row.original);
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
            placeholder="Search risks..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-64"
          />
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All severities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="MITIGATED">Mitigated</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingRisk(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Log Risk
        </Button>
      </FilterBar>

      <DataTable columns={columns} data={filtered} emptyMessage="No risks match your filters." />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingRisk ? "Edit Risk" : "Log Risk"}</DialogTitle>
          </DialogHeader>
          <RiskForm
            initiatives={initiatives}
            risk={editingRisk}
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
        title="Delete risk"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteRisk(deleteTarget.id);
          setDeleteTarget(null);
          router.refresh();
        }}
      />
    </div>
  );
}

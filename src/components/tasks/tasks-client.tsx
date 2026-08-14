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
import { TaskForm } from "@/components/forms/task-form";
import { taskStatusTone, priorityTone } from "@/lib/status";
import { deleteTask } from "@/lib/actions/tasks";

export type TaskRow = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: Date;
  initiativeId: string;
  initiative: { id: string; code: string; name: string };
};

type InitiativeOption = { id: string; code: string; name: string };

export function TasksClient({
  tasks,
  initiatives,
}: {
  tasks: TaskRow[];
  initiatives: InitiativeOption[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [initiativeFilter, setInitiativeFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<TaskRow | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
      if (initiativeFilter !== "ALL" && t.initiativeId !== initiativeFilter) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, statusFilter, initiativeFilter, search]);

  const columns: ColumnDef<TaskRow>[] = [
    {
      accessorKey: "title",
      header: "Task",
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
      accessorKey: "assignee",
      header: "Assignee",
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.assignee}</span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const t = priorityTone(row.original.priority);
        return <StatusBadge label={t.label} tone={t.tone} />;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const t = taskStatusTone(row.original.status);
        return <StatusBadge label={t.label} tone={t.tone} />;
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(row.original.dueDate, "MMM d, yyyy")}
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
              setEditingTask(row.original);
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
            placeholder="Search tasks..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={initiativeFilter} onValueChange={setInitiativeFilter}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All initiatives</SelectItem>
              {initiatives.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.code} · {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => {
            setEditingTask(undefined);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </FilterBar>

      <DataTable columns={columns} data={filtered} emptyMessage="No tasks match your filters." />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <TaskForm
            initiatives={initiatives}
            task={editingTask}
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
        title="Delete task"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteTask(deleteTarget.id);
          setDeleteTarget(null);
          router.refresh();
        }}
      />
    </div>
  );
}

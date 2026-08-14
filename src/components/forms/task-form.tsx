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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTask, updateTask } from "@/lib/actions/tasks";

const formSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assignee: z.string().min(1, "Assignee is required"),
  dueDate: z.string().min(1, "Due date is required"),
  initiativeId: z.string().min(1, "Select an initiative"),
});

type FormValues = z.infer<typeof formSchema>;

type TaskFormProps = {
  initiatives: { id: string; code: string; name: string }[];
  task?: {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee: string;
    dueDate: Date;
    initiativeId: string;
  };
  onSuccess: () => void;
};

export function TaskForm({ initiatives, task, onSuccess }: TaskFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status as FormValues["status"],
          priority: task.priority as FormValues["priority"],
          assignee: task.assignee,
          dueDate: format(task.dueDate, "yyyy-MM-dd"),
          initiativeId: task.initiativeId,
        }
      : {
          title: "",
          description: "",
          status: "TODO",
          priority: "MEDIUM",
          assignee: "",
          dueDate: "",
          initiativeId: initiatives[0]?.id ?? "",
        },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const payload = { ...values, dueDate: new Date(values.dueDate) };
      if (task) {
        await updateTask(task.id, payload);
      } else {
        await createTask(payload);
      }
      onSuccess();
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title ? (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={watch("status")}
            onValueChange={(v) => setValue("status", v as FormValues["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">To Do</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="DONE">Done</SelectItem>
              <SelectItem value="BLOCKED">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Priority</Label>
          <Select
            value={watch("priority")}
            onValueChange={(v) => setValue("priority", v as FormValues["priority"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="assignee">Assignee</Label>
          <Input id="assignee" {...register("assignee")} />
          {errors.assignee ? (
            <p className="text-xs text-destructive">{errors.assignee.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" type="date" {...register("dueDate")} />
          {errors.dueDate ? (
            <p className="text-xs text-destructive">{errors.dueDate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Initiative</Label>
        <Select
          value={watch("initiativeId")}
          onValueChange={(v) => setValue("initiativeId", v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {initiatives.map((i) => (
              <SelectItem key={i.id} value={i.id}>
                {i.code} · {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {task ? "Save Changes" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}

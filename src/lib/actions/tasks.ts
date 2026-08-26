"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(1),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assignee: z.string().min(1),
  dueDate: z.coerce.date(),
  initiativeId: z.string().optional().nullable(),
  marketId: z.string().optional().nullable(),
}).refine((data) => !!data.initiativeId || !!data.marketId, {
  message: "Select a market or initiative.",
  path: ["initiativeId"],
});

export type TaskInput = z.infer<typeof taskSchema>;

function normalize(input: TaskInput) {
  return {
    ...input,
    initiativeId: input.initiativeId || null,
    marketId: input.marketId || null,
  };
}

function revalidateTaskScope(task: { initiativeId: string | null; marketId: string | null }) {
  if (task.initiativeId) revalidatePath(`/initiatives/${task.initiativeId}`);
  if (task.marketId) revalidatePath(`/markets/${task.marketId}`);
}

export async function createTask(input: TaskInput) {
  const parsed = taskSchema.parse(input);
  const task = await prisma.task.create({ data: normalize(parsed) });
  await prisma.activity.create({
    data: {
      type: "TASK_CREATED",
      description: `Created task "${task.title}"`,
      entityType: "Task",
      entityId: task.id,
      actor: "You",
    },
  });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidateTaskScope(task);
  return task;
}

export async function updateTask(id: string, input: TaskInput) {
  const parsed = taskSchema.parse(input);
  const task = await prisma.task.update({ where: { id }, data: normalize(parsed) });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidateTaskScope(task);
  return task;
}

export async function deleteTask(id: string) {
  const task = await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidateTaskScope(task);
}

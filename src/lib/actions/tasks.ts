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
  initiativeId: z.string().min(1),
});

export type TaskInput = z.infer<typeof taskSchema>;

export async function createTask(input: TaskInput) {
  const data = taskSchema.parse(input);
  const task = await prisma.task.create({ data });
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
  revalidatePath(`/initiatives/${task.initiativeId}`);
  return task;
}

export async function updateTask(id: string, input: TaskInput) {
  const data = taskSchema.parse(input);
  const task = await prisma.task.update({ where: { id }, data });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/initiatives/${task.initiativeId}`);
  return task;
}

export async function deleteTask(id: string) {
  const task = await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/initiatives/${task.initiativeId}`);
}

import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { TasksClient } from "@/components/tasks/tasks-client";

export default async function TasksPage() {
  const [tasks, initiatives] = await Promise.all([
    prisma.task.findMany({
      orderBy: { dueDate: "asc" },
      include: { initiative: { select: { id: true, code: true, name: true } } },
    }),
    prisma.initiative.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Track execution work across every initiative."
      />
      <TasksClient tasks={tasks} initiatives={initiatives} />
    </div>
  );
}

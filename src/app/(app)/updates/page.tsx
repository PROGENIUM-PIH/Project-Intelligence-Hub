import { IntakeWorkbench } from "@/components/ai/intake-workbench";
import { prisma } from "@/lib/prisma";

export default async function UpdatesPage() {
  const [markets, initiatives] = await Promise.all([
    prisma.market.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, code: true } }),
    prisma.initiative.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true, name: true } }),
  ]);
  return <IntakeWorkbench markets={markets} initiatives={initiatives} />;
}

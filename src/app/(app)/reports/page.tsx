import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function ReportsPage() {
  const [markets, initiatives] = await Promise.all([
    prisma.market.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, code: true } }),
    prisma.initiative.findMany({ orderBy: { code: "asc" }, select: { id: true, code: true, name: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Reports" description="Create traceable project reports and export the underlying data as CSV." />
      <ReportsClient markets={markets} initiatives={initiatives} />
    </div>
  );
}

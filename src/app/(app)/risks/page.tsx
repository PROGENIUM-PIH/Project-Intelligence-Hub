import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { RisksClient } from "@/components/risks/risks-client";

export default async function RisksPage() {
  const [risks, initiatives] = await Promise.all([
    prisma.risk.findMany({
      orderBy: { identifiedDate: "desc" },
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
        title="Risks"
        description="Program risks and mitigation ownership across initiatives."
      />
      <RisksClient risks={risks} initiatives={initiatives} />
    </div>
  );
}

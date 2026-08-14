import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { MeetingsClient } from "@/components/meetings/meetings-client";

export default async function MeetingsPage() {
  const [meetings, markets, initiatives] = await Promise.all([
    prisma.meeting.findMany({
      orderBy: { date: "desc" },
      include: {
        market: { select: { id: true, code: true, name: true } },
        initiative: { select: { id: true, code: true, name: true } },
      },
    }),
    prisma.market.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
    prisma.initiative.findMany({
      orderBy: { code: "asc" },
      select: { id: true, code: true, name: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Meetings"
        description="Status reviews, steering committees, and workshops across the program."
      />
      <MeetingsClient meetings={meetings} markets={markets} initiatives={initiatives} />
    </div>
  );
}

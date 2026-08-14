import Link from "next/link";
import { Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { healthTone } from "@/lib/status";

export default async function MarketsPage() {
  const markets = await prisma.market.findMany({
    orderBy: { name: "asc" },
    include: { initiatives: true },
  });

  return (
    <div>
      <PageHeader
        title="Markets"
        description="Regional markets participating in the sales transformation program."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {markets.map((market) => {
          const { label, tone } = healthTone(market.status);
          return (
            <Link key={market.id} href={`/markets/${market.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {market.code}
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {market.name}
                      </p>
                    </div>
                  </div>
                  <StatusBadge label={label} tone={tone} />
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Region</span>
                    <span className="text-foreground">{market.region}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Market Lead</span>
                    <span className="text-foreground">{market.lead}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Linked Initiatives</span>
                    <span className="text-foreground">{market.initiatives.length}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

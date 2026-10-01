import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { MarketsRefreshButton } from "@/components/markets/markets-refresh-button";
import { MarketFormButton } from "@/components/markets/market-form-button";
import { MarketOwnerFilter } from "@/components/dashboard/market-owner-filter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const marketFlagImages: Record<string, string> = {
  france: "/flags/france.svg", germany: "/flags/germany.svg", austria: "/flags/austria.svg", poland: "/flags/poland.svg", norway: "/flags/norway.svg",
  "czech republic": "/flags/czech-republic.svg", czechia: "/flags/czech-republic.svg", netherlands: "/flags/netherlands.svg", uk: "/flags/uk.svg", "united kingdom": "/flags/uk.svg",
  ireland: "/flags/ireland.png.png", italy: "/flags/italy.png.png", sweden: "/flags/sweden.png.png", slovakia: "/flags/slovakia.png.png", belgium: "/flags/belgium.png.png", spain: "/flags/world (5).png",
};

export default async function MarketsPage({searchParams}:{searchParams:Promise<{owner?:string}>}) {
  const {owner}=await searchParams;
  const marketWhere = owner === "M. Vlacihova" || owner === "A. Kadlecova" ? { owner } : {};
  const markets = await prisma.market.findMany({ where: marketWhere, orderBy: { name: "asc" }, include: { _count: { select: { initiatives: true } } } });
  return <div>
    <PageHeader title="Market Steering" description="Steerize Implementation across Markets" actions={<><MarketOwnerFilter/><MarketFormButton/><MarketsRefreshButton/></>} />
    <div className="max-h-[calc(100vh-11rem)] overflow-y-auto pr-2 pb-6"><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{markets.map((market) => { const flagSrc = marketFlagImages[market.name.trim().toLowerCase()]; return <div key={market.id} className="relative h-full"><Link href={`/markets/${market.id}`} className="group block h-full"><Card className="pih-entity-card h-full transition-shadow hover:shadow-md"><CardHeader className="flex flex-row items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="pih-flag-icon relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border bg-secondary" aria-label={`${market.name} flag`}>{flagSrc ? <Image src={flagSrc} alt={`${market.name} flag`} fill sizes="40px" className="object-cover" /> : <span className="flex h-full w-full items-center justify-center text-xs font-semibold">{market.code}</span>}</div><div><p className="text-xs font-medium text-muted-foreground">{market.code}</p><p className="text-base font-semibold text-foreground">{market.name}</p></div></div></CardHeader><CardContent className="space-y-2 text-sm"><div className="flex justify-between text-muted-foreground"><span>Region</span><span className="text-foreground">{market.region}</span></div><div className="grid grid-cols-2 items-center gap-2"><div className="flex items-center justify-between text-muted-foreground"><span>Linked Initiatives</span><span className="text-foreground">{market._count.initiatives}</span></div><div className="flex items-center justify-between rounded-md bg-secondary/60 px-2 py-1 text-muted-foreground"><span>Market Owner</span><span className="font-medium text-foreground">{market.owner??"—"}</span></div></div></CardContent></Card></Link></div>; })}</div></div>
  </div>;
}

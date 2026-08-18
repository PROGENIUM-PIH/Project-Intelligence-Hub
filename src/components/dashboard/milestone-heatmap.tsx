const milestones = [
  "Onboarding Session",
  "1:1 Session / Follow up",
  "Implementation Plan aligned",
  "Implementation started",
  "Implementation done",
] as const;

type Market = { id:string; name:string; milestoneCompleted:number };

export function MilestoneHeatmap({markets}:{markets:Market[]}){
  return <section className="rounded-xl border bg-card p-5">
    <div className="mb-4"><h2 className="text-base font-semibold">Milestone Heatmap</h2><p className="mt-1 text-xs text-muted-foreground">Implementation progress across markets</p></div>
    <div className="overflow-x-auto pb-1">
      <div className="grid min-w-[760px] gap-1" style={{gridTemplateColumns:`190px repeat(${markets.length}, minmax(64px,1fr))`}}>
        <div />
        {markets.map(m=><div key={m.id} className="px-1 pb-2 text-center text-[10px] font-semibold leading-tight">{m.name}</div>)}
        {milestones.map((milestone,row)=>[
          <div key={`${milestone}-label`} className="flex min-h-11 items-center pr-3 text-[11px] font-medium leading-tight">{milestone}</div>,
          ...markets.map(m=>{const current=Math.min(Math.max(m.milestoneCompleted,0),4);const complete=m.milestoneCompleted>=5||row<current;const active=m.milestoneCompleted<5&&row===current;return <div key={`${m.id}-${milestone}`} title={`${m.name} · ${milestone} · ${complete?"Completed":active?"Current":"Upcoming"}`} className={`min-h-11 rounded-md border transition-transform hover:scale-[1.04] ${complete?"border-[#0E3A2F] bg-[#0E3A2F]":active?"border-[#78FAAE] bg-[#78FAAE] ring-1 ring-[#78FAAE]/40":"border-[#D5DCDA] bg-[#E3E9E6]"}`} />})
        ])}
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-4 border-t pt-3 text-[10px] text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#0E3A2F]"/>Completed</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-[#78FAAE]"/>Current</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border bg-[#E3E9E6]"/>Upcoming</span></div>
  </section>;
}

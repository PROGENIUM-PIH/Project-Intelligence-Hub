"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const milestones = [
  "Onboarding Session",
  "1:1 Session / Follow up",
  "Implementation Plan aligned",
  "Implementation started",
  "Implementation done",
] as const;

type Props = {
  marketId: string;
  marketName: string;
  autoCompleted?: number;
};

export function MilestoneJourney({ marketId, marketName, autoCompleted = 0 }: Props) {
  const storageKey = `pih-market-milestones:${marketId}`;
  const [manualCompleted, setManualCompleted] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(storageKey) || 0);
    setManualCompleted(Number.isFinite(saved) ? Math.min(Math.max(saved, 0), milestones.length) : 0);
    setLoaded(true);
  }, [storageKey]);

  const completed = Math.max(autoCompleted, manualCompleted);
  const currentIndex = completed >= milestones.length ? milestones.length - 1 : completed;
  const currentLabel = completed >= milestones.length ? "Implementation done" : milestones[currentIndex];
  const progress = Math.round((completed / milestones.length) * 100);

  const setCompleted = (value: number) => {
    const next = Math.min(Math.max(value, autoCompleted), milestones.length);
    setManualCompleted(next);
    window.localStorage.setItem(storageKey, String(next));
  };

  const sourceText = useMemo(() => autoCompleted > 0 ? `${autoCompleted} milestone${autoCompleted > 1 ? "s" : ""} detected from market meetings` : "Manual confirmation", [autoCompleted]);

  return <div className="rounded-xl border p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm font-semibold">{marketName}</p><p className="mt-1 text-xs text-muted-foreground">Current milestone: <span className="font-medium text-foreground">{currentLabel}</span> · {completed}/5 · {progress}%</p></div>
      <span className="rounded-full bg-[#78FAAE] px-2.5 py-1 text-[11px] font-semibold text-[#0E3A2F]">{completed >= 5 ? "Complete" : "In progress"}</span>
    </div>
    <div className="mt-5 grid grid-cols-5 gap-1">
      {milestones.map((label, index) => {
        const done = index < completed;
        const current = index === currentIndex && completed < milestones.length;
        return <button key={label} type="button" onClick={() => setCompleted(index + 1)} className="group text-left" title={`Set ${label} as reached`}>
          <div className={`mb-2 h-2 rounded-full transition-all ${done ? "bg-[#0E3A2F]" : current ? "bg-[#78FAAE] ring-2 ring-[#78FAAE]/35" : "bg-[#E3E9E6]"}`} />
          <div className={`text-[10px] leading-4 ${current ? "font-bold text-[#0E3A2F]" : done ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{done && <Check className="mr-1 inline h-3 w-3"/>}{label}</div>
        </button>;
      })}
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
      <p className="text-[11px] text-muted-foreground">{sourceText}. Click a milestone to confirm it and all previous steps.</p>
      {loaded && manualCompleted > autoCompleted && <Button type="button" variant="ghost" size="sm" onClick={() => setCompleted(autoCompleted)}>Reset manual status</Button>}
    </div>
  </div>;
}

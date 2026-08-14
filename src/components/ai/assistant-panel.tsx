"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { proposeUpdate, applyProposal, type ProposedUpdate } from "@/lib/actions/ai-assistant";

export function AssistantPanel() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [proposal, setProposal] = useState<ProposedUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const handlePropose = async () => {
    setLoading(true);
    setError(null);
    setProposal(null);
    setApplied(false);
    const result = await proposeUpdate(text);
    setLoading(false);
    if (result.ok) {
      setProposal(result.proposal);
    } else {
      setError(result.message);
    }
  };

  const handleApply = async () => {
    if (!proposal) return;
    setApplying(true);
    await applyProposal(proposal);
    setApplying(false);
    setApplied(true);
    setProposal(null);
    setText("");
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <CardTitle className="text-base">AI Assistant (Preview)</CardTitle>
        </div>
        <CardDescription>
          Describe an update in plain English. The assistant proposes a structured
          change for you to review — nothing is saved until you confirm it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder='e.g. "Mark task Finalize configurator UAT sign-off as done" or "Set Germany status to at risk"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Rule-based preview parser for the demo — no external AI service is called.
          </p>
          <Button onClick={handlePropose} disabled={loading || !text.trim()}>
            {loading ? "Thinking..." : "Preview Update"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {error ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        {applied ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            Update applied successfully.
          </div>
        ) : null}

        {proposal ? (
          <div className="rounded-lg border border-border bg-secondary/40 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Proposed Update
            </p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{proposal.entityType}</span>
                <span className="text-right font-medium text-foreground">
                  {proposal.entityLabel}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">{proposal.fieldLabel}</span>
                <span className="flex items-center gap-1.5 text-right font-medium text-foreground">
                  {proposal.currentValueLabel}
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  {proposal.proposedValueLabel}
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProposal(null)}
                disabled={applying}
              >
                <X className="h-4 w-4" />
                Discard
              </Button>
              <Button size="sm" onClick={handleApply} disabled={applying}>
                <Check className="h-4 w-4" />
                {applying ? "Applying..." : "Confirm & Apply"}
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

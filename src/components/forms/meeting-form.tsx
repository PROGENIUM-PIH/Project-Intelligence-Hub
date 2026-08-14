"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMeeting, updateMeeting } from "@/lib/actions/meetings";

const formSchema = z.object({
  title: z.string().min(3, "Title is required"),
  type: z.enum(["STATUS_REVIEW", "STEERING_COMMITTEE", "WORKSHOP", "KICKOFF", "OTHER"]),
  scope: z.enum(["MARKET", "INITIATIVE"]),
  date: z.string().min(1, "Date is required"),
  notes: z.string().min(1, "Notes are required"),
  marketId: z.string().optional(),
  initiativeId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type MeetingFormProps = {
  markets: { id: string; code: string; name: string }[];
  initiatives: { id: string; code: string; name: string }[];
  meeting?: {
    id: string;
    title: string;
    type: string;
    scope: string;
    date: Date;
    notes: string;
    marketId: string | null;
    initiativeId: string | null;
  };
  onSuccess: () => void;
};

export function MeetingForm({ markets, initiatives, meeting, onSuccess }: MeetingFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: meeting
      ? {
          title: meeting.title,
          type: meeting.type as FormValues["type"],
          scope: meeting.scope as FormValues["scope"],
          date: format(meeting.date, "yyyy-MM-dd"),
          notes: meeting.notes,
          marketId: meeting.marketId ?? undefined,
          initiativeId: meeting.initiativeId ?? undefined,
        }
      : {
          title: "",
          type: "STATUS_REVIEW",
          scope: "MARKET",
          date: "",
          notes: "",
          marketId: markets[0]?.id,
          initiativeId: initiatives[0]?.id,
        },
  });

  const scope = watch("scope");

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const payload = { ...values, date: new Date(values.date) };
      if (meeting) {
        await updateMeeting(meeting.id, payload);
      } else {
        await createMeeting(payload);
      }
      onSuccess();
    } catch {
      setServerError("Something went wrong. Please check the form and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title")} />
        {errors.title ? (
          <p className="text-xs text-destructive">{errors.title.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select
            value={watch("type")}
            onValueChange={(v) => setValue("type", v as FormValues["type"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STATUS_REVIEW">Status Review</SelectItem>
              <SelectItem value="STEERING_COMMITTEE">Steering Committee</SelectItem>
              <SelectItem value="WORKSHOP">Workshop</SelectItem>
              <SelectItem value="KICKOFF">Kickoff</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
          {errors.date ? (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Scope</Label>
        <Select
          value={scope}
          onValueChange={(v) => setValue("scope", v as FormValues["scope"])}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MARKET">Market</SelectItem>
            <SelectItem value="INITIATIVE">Initiative</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scope === "MARKET" ? (
        <div className="space-y-1.5">
          <Label>Market</Label>
          <Select value={watch("marketId")} onValueChange={(v) => setValue("marketId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a market" />
            </SelectTrigger>
            <SelectContent>
              {markets.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.code} · {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>Initiative</Label>
          <Select
            value={watch("initiativeId")}
            onValueChange={(v) => setValue("initiativeId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an initiative" />
            </SelectTrigger>
            <SelectContent>
              {initiatives.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.code} · {i.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} {...register("notes")} />
        {errors.notes ? (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        ) : null}
      </div>

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {meeting ? "Save Changes" : "Schedule Meeting"}
        </Button>
      </div>
    </form>
  );
}

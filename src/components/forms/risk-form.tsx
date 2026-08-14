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
import { createRisk, updateRisk } from "@/lib/actions/risks";

const formSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["OPEN", "MITIGATED", "CLOSED"]),
  owner: z.string().min(1, "Owner is required"),
  identifiedDate: z.string().min(1, "Identified date is required"),
  initiativeId: z.string().min(1, "Select an initiative"),
});

type FormValues = z.infer<typeof formSchema>;

type RiskFormProps = {
  initiatives: { id: string; code: string; name: string }[];
  risk?: {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    owner: string;
    identifiedDate: Date;
    initiativeId: string;
  };
  onSuccess: () => void;
};

export function RiskForm({ initiatives, risk, onSuccess }: RiskFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: risk
      ? {
          title: risk.title,
          description: risk.description,
          severity: risk.severity as FormValues["severity"],
          status: risk.status as FormValues["status"],
          owner: risk.owner,
          identifiedDate: format(risk.identifiedDate, "yyyy-MM-dd"),
          initiativeId: risk.initiativeId,
        }
      : {
          title: "",
          description: "",
          severity: "MEDIUM",
          status: "OPEN",
          owner: "",
          identifiedDate: format(new Date(), "yyyy-MM-dd"),
          initiativeId: initiatives[0]?.id ?? "",
        },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const payload = { ...values, identifiedDate: new Date(values.identifiedDate) };
      if (risk) {
        await updateRisk(risk.id, payload);
      } else {
        await createRisk(payload);
      }
      onSuccess();
    } catch {
      setServerError("Something went wrong. Please try again.");
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

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
        {errors.description ? (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Severity</Label>
          <Select
            value={watch("severity")}
            onValueChange={(v) => setValue("severity", v as FormValues["severity"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select
            value={watch("status")}
            onValueChange={(v) => setValue("status", v as FormValues["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="MITIGATED">Mitigated</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="owner">Owner</Label>
          <Input id="owner" {...register("owner")} />
          {errors.owner ? (
            <p className="text-xs text-destructive">{errors.owner.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="identifiedDate">Identified</Label>
          <Input id="identifiedDate" type="date" {...register("identifiedDate")} />
          {errors.identifiedDate ? (
            <p className="text-xs text-destructive">{errors.identifiedDate.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Initiative</Label>
        <Select
          value={watch("initiativeId")}
          onValueChange={(v) => setValue("initiativeId", v)}
        >
          <SelectTrigger>
            <SelectValue />
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

      {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {risk ? "Save Changes" : "Log Risk"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { saveLeadAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { leadSources } from "@/lib/constants";
import { leadSchema } from "@/lib/validators";
import type { Lead } from "@/types";

type LeadValues = z.infer<typeof leadSchema>;

export function LeadForm({
  lead,
  onSuccess
}: {
  lead?: Lead | null;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LeadValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      id: lead?.id,
      fullName: lead?.fullName ?? "",
      phone: lead?.phone ?? "",
      email: lead?.email ?? "",
      source: lead?.source ?? "Facebook",
      interestedCategory: lead?.interestedCategory ?? "B",
      status: lead?.status ?? "new",
      notes: lead?.notes ?? ""
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveLeadAction(values);
          if (result.success) {
            toast.success(result.message);
            router.refresh();
            onSuccess?.();
          } else {
            toast.error(result.message);
          }
        })
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName ? <p className="text-sm text-rose-600">{errors.fullName.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Select id="source" {...register("source")}>
            {leadSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="interestedCategory">Interested category</Label>
          <Input id="interestedCategory" {...register("interestedCategory")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="interested">Interested</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : lead ? "Update lead" : "Create lead"}
      </Button>
    </form>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { savePaymentAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { paymentSchema } from "@/lib/validators";
import type { Payment, Student } from "@/types";

type PaymentValues = z.infer<typeof paymentSchema>;

export function PaymentForm({
  payment,
  students,
  onSuccess
}: {
  payment?: Payment | null;
  students: Student[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      id: payment?.id,
      studentId: payment?.studentId ?? students[0]?.id ?? "",
      amount: payment?.amount ?? 1000,
      paymentDate: payment?.paymentDate ?? "2026-04-09",
      paymentMethod: payment?.paymentMethod ?? "card",
      notes: payment?.notes ?? ""
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        startTransition(async () => {
          const result = await savePaymentAction(values);
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
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="studentId">Student</Label>
          <Select id="studentId" {...register("studentId")}>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" {...register("amount")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment date</Label>
            <Input id="paymentDate" type="date" {...register("paymentDate")} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment method</Label>
          <Select id="paymentMethod" {...register("paymentMethod")}>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : payment ? "Update payment" : "Record payment"}
      </Button>
    </form>
  );
}

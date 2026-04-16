import { CreditCard, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import type { EnrichedStudent } from "@/types";

export function PaymentSummaryWidget({ student }: { student: EnrichedStudent }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Payment Summary</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Live view of the student balance and collection status.</p>
        </div>
        <Wallet className="h-5 w-5 text-slate-400" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Course Price</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatCurrency(student.totalCoursePrice)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-700">Collected</p>
            <p className="mt-2 text-xl font-semibold text-emerald-800">{formatCurrency(student.totalPaid)}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-amber-700">Remaining</p>
            <p className="mt-2 text-xl font-semibold text-amber-800">{formatCurrency(student.balanceRemaining)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-2">
              <CreditCard className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Collection status</p>
              <p className="text-sm text-slate-500">Updated from recorded installments</p>
            </div>
          </div>
          <StatusBadge status={student.paymentStatus} />
        </div>
      </CardContent>
    </Card>
  );
}

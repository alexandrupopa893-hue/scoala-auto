import { Plus } from "lucide-react";

import { FormSheet } from "@/components/forms/form-sheet";
import { PaymentForm } from "@/components/forms/payment-form";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentsTable } from "@/components/tables/payments-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ensureRouteAccess } from "@/lib/auth/permissions";
import { requireCurrentUser } from "@/lib/auth/session";
import { getEnrichedPayments, getEnrichedStudents } from "@/lib/data/tenant-repository";
import { formatCurrency } from "@/lib/utils";

export default async function PaymentsPage() {
  const user = await requireCurrentUser();
  ensureRouteAccess(user.role, "payments");

  const payments = getEnrichedPayments(user);
  const students = getEnrichedStudents(user);
  const collected = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = students.reduce((sum, student) => sum + student.balanceRemaining, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Payments"
        title="Stay ahead of balances and installment tracking"
        description="See what has been collected, what is still open, and record new payments quickly."
        actions={
          <FormSheet
            title="Record payment"
            description="Capture a new installment against the student account."
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                Record payment
              </Button>
            }
          >
            <PaymentForm students={students} />
          </FormSheet>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Collected Revenue</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(collected)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Outstanding Balance</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(outstanding)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Transactions</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{payments.length}</p>
          </CardContent>
        </Card>
      </div>

      <PaymentsTable payments={payments} />
    </div>
  );
}

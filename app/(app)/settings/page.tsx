import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ensureRouteAccess } from "@/lib/auth/permissions";
import { requireCurrentUser } from "@/lib/auth/session";
import { demoUsers } from "@/lib/demo-tenant-data";

export default async function SettingsPage() {
  const user = await requireCurrentUser();
  ensureRouteAccess(user.role, "settings");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Demo configuration and rollout basics"
        description="A lightweight admin page for seeded accounts, environment expectations, and launch readiness."
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
            <p className="text-sm text-slate-500">These are the seeded users included with the MVP.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoUsers.map((account) => (
              <div key={account.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-medium text-slate-950">{account.fullName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {account.email} • {account.role}
                </p>
                <p className="mt-2 text-sm text-slate-500">{account.organizationName}</p>
                <p className="mt-2 text-sm text-slate-600">Password: {account.password}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational Readiness</CardTitle>
            <p className="text-sm text-slate-500">What this MVP already covers for client demos and early pilots.</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">
              Protected dashboard with role-aware navigation for admin, office staff, and instructors.
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              Student lifecycle, lead conversion flow, payments, document handling, schedule validation, and task reminders.
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              Supabase-ready schema, seed strategy, auth hooks, and storage path for student documents.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, CalendarPlus2, CreditCard, FilePlus2, UserPlus2, UsersRound } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasRouteAccess } from "@/lib/auth/permissions";
import type { AppUser } from "@/types";

const actionCatalog = [
  {
    href: "/students",
    label: "Add student",
    description: "Create a fresh student profile and assign an instructor.",
    icon: UserPlus2,
    routeKey: "students" as const
  },
  {
    href: "/schedule",
    label: "Schedule lesson",
    description: "Plan the next drive and keep the weekly board accurate.",
    icon: CalendarPlus2,
    routeKey: "schedule" as const
  },
  {
    href: "/payments",
    label: "Record payment",
    description: "Capture installments and keep balances visible.",
    icon: CreditCard,
    routeKey: "payments" as const
  },
  {
    href: "/leads",
    label: "Review leads",
    description: "Convert fresh interest into enrollments faster.",
    icon: UsersRound,
    routeKey: "leads" as const
  },
  {
    href: "/students",
    label: "Upload document",
    description: "Attach contracts, ID scans, and medical documents.",
    icon: FilePlus2,
    routeKey: "students" as const
  }
];

export function QuickActions({ user }: { user: AppUser }) {
  const actions = actionCatalog.filter((action) => hasRouteAccess(user.role, action.routeKey));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-slate-500">Frequent operations for the office and instructors.</p>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className="group flex items-start gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4 transition hover:border-teal-200 hover:bg-white"
            >
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <Icon className="h-5 w-5 text-teal-700" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-950">{action.label}</p>
                <p className="mt-1 text-sm text-slate-500">{action.description}</p>
              </div>
              <span className="self-center rounded-xl p-2 text-slate-500">
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

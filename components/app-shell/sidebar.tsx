"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarRange,
  CreditCard,
  LayoutDashboard,
  Settings,
  Target,
  UserSquare2,
  Users2
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { hasRouteAccess } from "@/lib/auth/permissions";
import { roleLabels } from "@/lib/constants";
import type { AppUser } from "@/types";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, routeKey: "dashboard" as const },
  { href: "/leads", label: "Leads", icon: Target, routeKey: "leads" as const },
  { href: "/students", label: "Students", icon: Users2, routeKey: "students" as const },
  { href: "/instructors", label: "Instructors", icon: UserSquare2, routeKey: "instructors" as const },
  { href: "/schedule", label: "Schedule", icon: CalendarRange, routeKey: "schedule" as const },
  { href: "/payments", label: "Payments", icon: CreditCard, routeKey: "payments" as const },
  { href: "/tasks", label: "Tasks", icon: Target, routeKey: "tasks" as const },
  { href: "/settings", label: "Settings", icon: Settings, routeKey: "settings" as const }
];

export function Sidebar({
  user,
  mobile,
  onNavigate
}: {
  user: AppUser;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col justify-between rounded-[2rem] border border-white/60 bg-[rgba(255,255,255,0.78)] p-5 shadow-soft backdrop-blur",
        mobile ? "max-w-xs" : "min-h-[calc(100vh-2rem)]"
      )}
    >
      <div>
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-600 text-lg font-semibold text-white">
            DS
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">DriveFlow</p>
            <p className="text-sm text-slate-500">Driving School CRM</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems
            .filter((item) => hasRouteAccess(user.role, item.routeKey))
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-slate-950 text-white shadow-card"
                      : "text-slate-600 hover:bg-white hover:text-slate-950"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>
      </div>

      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} />
          <div>
            <p className="font-semibold text-slate-950">{user.fullName}</p>
            <p className="text-sm text-slate-500">{roleLabels[user.role]}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

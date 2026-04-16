import { redirect } from "next/navigation";

import type { Role } from "@/types";

const routePermissions: Record<string, Role[]> = {
  dashboard: ["admin", "instructor", "staff"],
  leads: ["admin", "staff"],
  students: ["admin", "instructor", "staff"],
  instructors: ["admin", "instructor", "staff"],
  schedule: ["admin", "instructor", "staff"],
  payments: ["admin", "staff"],
  tasks: ["admin", "instructor", "staff"],
  settings: ["admin"]
};

export function hasRouteAccess(role: Role, routeKey: keyof typeof routePermissions) {
  return routePermissions[routeKey].includes(role);
}

export function ensureRouteAccess(role: Role, routeKey: keyof typeof routePermissions) {
  if (!hasRouteAccess(role, routeKey)) {
    redirect("/dashboard");
  }
}

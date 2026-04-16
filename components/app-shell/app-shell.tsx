"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import type { AppUser } from "@/types";

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page-glow">
      <div className="mx-auto flex max-w-[1600px] gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="hidden w-[290px] shrink-0 lg:block">
          <Sidebar user={user} />
        </div>
        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col gap-4 lg:gap-6">
          <Topbar user={user} onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="flex-1">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[290px] p-4">
            <Sidebar user={user} mobile onNavigate={() => setMobileOpen(false)} />
          </div>
          <button className="absolute inset-0 -z-10" onClick={() => setMobileOpen(false)} aria-label="Close menu" />
        </div>
      ) : null}
    </div>
  );
}

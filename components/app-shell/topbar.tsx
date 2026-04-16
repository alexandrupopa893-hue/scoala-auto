"use client";

import { useTransition } from "react";
import { format } from "date-fns";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import type { AppUser } from "@/types";

export function Topbar({
  user,
  onOpenMobileNav
}: {
  user: AppUser;
  onOpenMobileNav: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-white/60 bg-[rgba(255,255,255,0.72)] p-4 shadow-card backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="lg:hidden" onClick={onOpenMobileNav}>
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-sm text-slate-500">{format(new Date("2026-04-09"), "EEEE, dd MMMM yyyy")}</p>
          <p className="text-lg font-semibold text-slate-950">Welcome back, {user.fullName.split(" ")[0]}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Quick search students, leads, lessons..." className="pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3 py-2 sm:flex">
          <Avatar name={user.fullName} className="h-9 w-9" />
          <div className="pr-2">
            <p className="text-sm font-medium text-slate-950">{user.email}</p>
            <p className="text-xs text-slate-500">Signed in</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await signOutAction();
                router.push("/login");
                router.refresh();
              })
            }
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

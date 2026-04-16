import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function TableToolbar({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/70 p-4 shadow-card backdrop-blur lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      {children}
    </div>
  );
}

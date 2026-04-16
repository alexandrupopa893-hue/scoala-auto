"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTrigger = Dialog.Trigger;
export const SheetClose = Dialog.Close;

export function SheetContent({
  className,
  children,
  side = "right"
}: {
  className?: string;
  children: React.ReactNode;
  side?: "right" | "left";
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          "fixed top-0 z-50 h-full w-full max-w-xl border-l border-white/50 bg-[rgba(248,250,252,0.96)] p-6 shadow-2xl outline-none",
          side === "right" ? "right-0" : "left-0 border-r border-l-0",
          className
        )}
      >
        <Dialog.Close className="absolute right-5 top-5 rounded-xl p-2 text-slate-500 transition hover:bg-slate-100">
          <X className="h-4 w-4" />
        </Dialog.Close>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-6 flex flex-col gap-1", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-xl font-semibold text-slate-950", className)} {...props} />;
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { updateLessonStatusAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import type { LessonStatus } from "@/types";

export function LessonStatusButton({
  lessonId,
  status,
  label,
  variant = "outline"
}: {
  lessonId: string;
  status: LessonStatus;
  label: string;
  variant?: "outline" | "default" | "ghost";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await updateLessonStatusAction(lessonId, status);
          if (result.success) {
            toast.success(result.message);
            router.refresh();
          } else {
            toast.error(result.message);
          }
        })
      }
    >
      {isPending ? "Updating..." : label}
    </Button>
  );
}

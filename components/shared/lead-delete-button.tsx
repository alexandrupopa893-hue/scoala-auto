"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteLeadAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";

export function LeadDeleteButton({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const result = await deleteLeadAction(leadId);
          if (result.success) {
            toast.success(result.message);
            router.push("/leads");
            router.refresh();
          } else {
            toast.error(result.message);
          }
        })
      }
    >
      {isPending ? "Deleting..." : "Delete lead"}
    </Button>
  );
}

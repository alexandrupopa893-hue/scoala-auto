"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { saveNoteAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NoteEntityType } from "@/types";

export function NoteComposer({
  entityType,
  entityId
}: {
  entityType: NoteEntityType;
  entityId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState("");

  return (
    <form
      className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await saveNoteAction({ entityType, entityId, content });
          if (result.success) {
            toast.success(result.message);
            setContent("");
            router.refresh();
          } else {
            toast.error(result.message);
          }
        });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor={`note-${entityType}-${entityId}`}>Add note</Label>
        <Textarea
          id={`note-${entityType}-${entityId}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Write a helpful internal note..."
        />
      </div>
      <Button type="submit" disabled={isPending || content.trim().length < 3}>
        {isPending ? "Saving..." : "Save note"}
      </Button>
    </form>
  );
}

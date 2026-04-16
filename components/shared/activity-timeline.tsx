import { formatDateTime } from "@/lib/utils";
import type { Note } from "@/types";

export function ActivityTimeline({ notes }: { notes: Note[] }) {
  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-medium text-slate-950">{note.authorName}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{formatDateTime(note.createdAt)}</p>
          </div>
          <p className="text-sm leading-6 text-slate-600">{note.content}</p>
        </div>
      ))}
    </div>
  );
}

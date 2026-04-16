import { Clock3, UserRound } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { formatTimeRange } from "@/lib/utils";
import type { EnrichedLesson } from "@/types";

export function LessonCard({ lesson }: { lesson: EnrichedLesson }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-950">{lesson.student?.fullName ?? "Student"}</p>
          <p className="text-sm text-slate-500">{lesson.instructor?.fullName ?? "Instructor"}</p>
        </div>
        <StatusBadge status={lesson.status} />
      </div>
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-slate-400" />
          <span>{formatTimeRange(lesson.startTime, lesson.endTime)}</span>
        </div>
        <div className="flex items-start gap-2">
          <UserRound className="mt-0.5 h-4 w-4 text-slate-400" />
          <span>{lesson.notes}</span>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatTimeRange } from "@/lib/utils";
import type { EnrichedLesson } from "@/types";

export function UpcomingLessonsCard({ lessons }: { lessons: EnrichedLesson[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Upcoming Lessons</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Today and next sessions that need attention from the team.</p>
        </div>
        <Link href="/schedule" className="text-sm font-medium text-teal-700">
          Open schedule
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-950">{lesson.student?.fullName ?? "Student"}</p>
              <p className="mt-1 text-sm text-slate-500">
                {formatDate(lesson.date)} • {formatTimeRange(lesson.startTime, lesson.endTime)} •{" "}
                {lesson.instructor?.fullName}
              </p>
            </div>
            <StatusBadge status={lesson.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

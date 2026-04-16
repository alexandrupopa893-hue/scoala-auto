"use client";

import { useState } from "react";
import { addDays, format, parseISO, startOfWeek } from "date-fns";

import { LessonCard } from "@/components/shared/lesson-card";
import { Select } from "@/components/ui/select";
import { getWeekRangeLabel } from "@/lib/utils";
import type { EnrichedLesson, Instructor } from "@/types";

export function ScheduleBoard({
  lessons,
  instructors,
  referenceDate
}: {
  lessons: EnrichedLesson[];
  instructors: Instructor[];
  referenceDate: string;
}) {
  const [instructorId, setInstructorId] = useState("all");

  const weekStart = startOfWeek(parseISO(referenceDate), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const filtered = lessons.filter((lesson) => instructorId === "all" || lesson.instructorId === instructorId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-card backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Weekly View</p>
          <p className="mt-1 text-sm text-slate-500">{getWeekRangeLabel(referenceDate)}</p>
        </div>
        <Select value={instructorId} onChange={(event) => setInstructorId(event.target.value)} className="w-full sm:w-[240px]">
          <option value="all">All instructors</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.fullName}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        {days.map((day) => {
          const isoDay = format(day, "yyyy-MM-dd");
          const dayLessons = filtered
            .filter((lesson) => lesson.date === isoDay)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={isoDay} className="rounded-3xl border border-white/60 bg-white/72 p-4 shadow-card">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{format(day, "EEE")}</p>
                <p className="text-xl font-semibold text-slate-950">{format(day, "dd MMM")}</p>
              </div>
              <div className="space-y-3">
                {dayLessons.length ? (
                  dayLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    No lessons scheduled.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { Plus } from "lucide-react";

import { FormSheet } from "@/components/forms/form-sheet";
import { LessonForm } from "@/components/forms/lesson-form";
import { LessonStatusButton } from "@/components/shared/lesson-status-button";
import { PageHeader } from "@/components/shared/page-header";
import { ScheduleBoard } from "@/components/shared/schedule-board";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureRouteAccess } from "@/lib/auth/permissions";
import { requireCurrentUser } from "@/lib/auth/session";
import { demoReferenceDate } from "@/lib/demo-tenant-data";
import { getEnrichedLessons, getInstructors, getStudentsForUser } from "@/lib/data/tenant-repository";
import { formatDate, formatTimeRange } from "@/lib/utils";

export default async function SchedulePage() {
  const user = await requireCurrentUser();
  ensureRouteAccess(user.role, "schedule");

  const lessons = getEnrichedLessons(user);
  const instructors = getInstructors(user);
  const students = getStudentsForUser(user);
  const todaysLessons = lessons.filter((lesson) => lesson.date === demoReferenceDate);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scheduling"
        title="Plan the week without collisions"
        description="A practical weekly board for lesson coordination, instructor availability, and same-day visibility."
        actions={
          <FormSheet
            title="Schedule lesson"
            description="Create a driving lesson and validate instructor or student overlaps."
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                Schedule lesson
              </Button>
            }
          >
            <LessonForm students={students} instructors={instructors} />
          </FormSheet>
        }
      />

      <ScheduleBoard lessons={lessons} instructors={instructors} referenceDate={demoReferenceDate} />

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Lesson List</CardTitle>
          <p className="text-sm text-slate-500">Compact chronological view for quick office and instructor coordination.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {todaysLessons.map((lesson) => (
            <div key={lesson.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="font-medium text-slate-950">{lesson.student?.fullName}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(lesson.date)} • {formatTimeRange(lesson.startTime, lesson.endTime)} •{" "}
                  {lesson.instructor?.fullName}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="mr-2 text-sm text-slate-500">{lesson.notes}</p>
                {lesson.status === "scheduled" ? (
                  <>
                    <LessonStatusButton lessonId={lesson.id} status="completed" label="Mark completed" />
                    <LessonStatusButton lessonId={lesson.id} status="canceled" label="Cancel" variant="ghost" />
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

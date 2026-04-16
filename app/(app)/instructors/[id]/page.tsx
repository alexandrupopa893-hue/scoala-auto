import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { LessonCard } from "@/components/shared/lesson-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { StudentProgressBar } from "@/components/shared/student-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/session";
import { enrichLesson, enrichStudent, getInstructorById } from "@/lib/data/tenant-repository";

export default async function InstructorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const instructor = getInstructorById(id, user);

  if (!instructor) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Instructor Detail"
        title={instructor.fullName}
        description={`${instructor.categories.join(", ")} • ${instructor.email} • ${instructor.phone}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/instructors">
              <ArrowLeft className="h-4 w-4" />
              Back to instructors
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBadge status={instructor.status} />
            <p className="text-sm leading-7 text-slate-600">{instructor.bio}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Assigned students</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{instructor.assignedStudents.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Weekly lessons</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{instructor.weeklyLessons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <p className="text-sm text-slate-500">The next practical sessions currently assigned to this instructor.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {instructor.weeklyLessons.slice(0, 6).map((lesson) => (
              <LessonCard key={lesson.id} lesson={enrichLesson(lesson)} />
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Students</CardTitle>
          <p className="text-sm text-slate-500">Visibility into progress and exam-readiness for the current roster.</p>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {instructor.assignedStudents.map((student) => {
            const enriched = enrichStudent(student);
            return (
              <div key={student.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{student.fullName}</p>
                    <p className="text-sm text-slate-500">{student.category}</p>
                  </div>
                  <StatusBadge status={student.status} />
                </div>
                <StudentProgressBar
                  completedHours={student.completedHours}
                  totalRequiredPracticalHours={student.totalRequiredPracticalHours}
                />
                <div className="mt-4">
                  <StatusBadge status={enriched.paymentStatus} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

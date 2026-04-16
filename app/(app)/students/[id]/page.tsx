import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { NoteComposer } from "@/components/forms/note-composer";
import { StudentForm } from "@/components/forms/student-form";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { DocumentUploader } from "@/components/shared/document-uploader";
import { LessonCard } from "@/components/shared/lesson-card";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentSummaryWidget } from "@/components/shared/payment-summary-widget";
import { StatusBadge } from "@/components/shared/status-badge";
import { StudentProgressBar } from "@/components/shared/student-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/session";
import { enrichLesson, getInstructors, getStudentById } from "@/lib/data/tenant-repository";
import { formatDate } from "@/lib/utils";

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const student = getStudentById(id, user);

  if (!student) {
    notFound();
  }

  const instructors = getInstructors(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Detail"
        title={student.fullName}
        description={`Enrolled ${formatDate(student.enrollmentDate)} • ${student.category} • Instructor ${student.instructor?.fullName}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/students">
              <ArrowLeft className="h-4 w-4" />
              Back to students
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="xl:col-span-2">
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={student.status} />
              <StatusBadge status={student.paymentStatus} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Phone</p>
                <p className="mt-2 font-semibold text-slate-950">{student.phone}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                <p className="mt-2 font-semibold text-slate-950">{student.email}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Date of Birth</p>
                <p className="mt-2 font-semibold text-slate-950">{formatDate(student.dateOfBirth)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Exam Date</p>
                <p className="mt-2 font-semibold text-slate-950">{formatDate(student.examDate)}</p>
              </div>
            </div>
            <StudentProgressBar
              completedHours={student.completedHours}
              totalRequiredPracticalHours={student.totalRequiredPracticalHours}
            />
          </CardContent>
        </Card>

        <div className="xl:col-span-2">
          <PaymentSummaryWidget student={student} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Edit student</CardTitle>
            <p className="text-sm text-slate-500">Update assignments, hours, and timeline without leaving the profile.</p>
          </CardHeader>
          <CardContent>
            <StudentForm student={student} instructors={instructors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent lessons</CardTitle>
            <p className="text-sm text-slate-500">The latest practical sessions and upcoming bookings.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {student.lessons.slice(0, 6).map((lesson) => (
              <LessonCard key={lesson.id} lesson={enrichLesson(lesson)} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <DocumentUploader studentId={student.id} documents={student.documents} />

        <Card>
          <CardHeader>
            <CardTitle>Activity & Notes</CardTitle>
            <p className="text-sm text-slate-500">A compact operational timeline for the office and instructor team.</p>
          </CardHeader>
          <CardContent className="space-y-5">
            <NoteComposer entityType="student" entityId={student.id} />
            <ActivityTimeline notes={student.notesFeed} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

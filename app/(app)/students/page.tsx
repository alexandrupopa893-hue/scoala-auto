import { Plus } from "lucide-react";

import { FormSheet } from "@/components/forms/form-sheet";
import { StudentForm } from "@/components/forms/student-form";
import { PageHeader } from "@/components/shared/page-header";
import { StudentsTable } from "@/components/tables/students-table";
import { Button } from "@/components/ui/button";
import { requireCurrentUser } from "@/lib/auth/session";
import { getEnrichedStudents, getInstructors } from "@/lib/data/tenant-repository";

export default async function StudentsPage() {
  const user = await requireCurrentUser();
  const students = getEnrichedStudents(user);
  const instructors = getInstructors(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Student Management"
        title="The live roster of students in training"
        description="Filter by status, category, or instructor to keep enrollments, progress, and payments under control."
        actions={
          user.role === "instructor" ? null : (
            <FormSheet
              title="Create student"
              description="Open a new student profile with the essentials for scheduling and payments."
              trigger={
                <Button>
                  <Plus className="h-4 w-4" />
                  Add student
                </Button>
              }
            >
              <StudentForm instructors={instructors} />
            </FormSheet>
          )
        }
      />

      <StudentsTable students={students} instructors={instructors} />
    </div>
  );
}

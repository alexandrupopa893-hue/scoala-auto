"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { saveStudentAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { courseCategories } from "@/lib/constants";
import { studentSchema } from "@/lib/validators";
import type { Instructor, Student } from "@/types";

type StudentValues = z.infer<typeof studentSchema>;

export function StudentForm({
  student,
  instructors,
  onSuccess
}: {
  student?: Student | null;
  instructors: Instructor[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<StudentValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      id: student?.id,
      fullName: student?.fullName ?? "",
      phone: student?.phone ?? "",
      email: student?.email ?? "",
      dateOfBirth: student?.dateOfBirth ?? "",
      category: student?.category ?? "B",
      enrollmentDate: student?.enrollmentDate ?? "2026-04-09",
      assignedInstructorId: student?.assignedInstructorId ?? instructors[0]?.id ?? "",
      status: student?.status ?? "enrolled",
      totalRequiredPracticalHours: student?.totalRequiredPracticalHours ?? 30,
      completedHours: student?.completedHours ?? 0,
      examDate: student?.examDate ?? "",
      totalCoursePrice: student?.totalCoursePrice ?? 4500,
      notes: student?.notes ?? ""
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveStudentAction(values);
          if (result.success) {
            toast.success(result.message);
            router.refresh();
            onSuccess?.();
          } else {
            toast.error(result.message);
          }
        })
      )}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName ? <p className="text-sm text-rose-600">{errors.fullName.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="enrollmentDate">Enrollment date</Label>
          <Input id="enrollmentDate" type="date" {...register("enrollmentDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select id="category" {...register("category")}>
            {courseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedInstructorId">Instructor</Label>
          <Select id="assignedInstructorId" {...register("assignedInstructorId")}>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.fullName}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            <option value="enrolled">Enrolled</option>
            <option value="theory_in_progress">Theory in Progress</option>
            <option value="practical_in_progress">Practical in Progress</option>
            <option value="exam_scheduled">Exam Scheduled</option>
            <option value="completed">Completed</option>
            <option value="inactive">Inactive</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalRequiredPracticalHours">Required practical hours</Label>
          <Input id="totalRequiredPracticalHours" type="number" {...register("totalRequiredPracticalHours")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="completedHours">Completed hours</Label>
          <Input id="completedHours" type="number" {...register("completedHours")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="examDate">Exam date</Label>
          <Input id="examDate" type="date" {...register("examDate")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalCoursePrice">Course price</Label>
          <Input id="totalCoursePrice" type="number" {...register("totalCoursePrice")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : student ? "Update student" : "Create student"}
      </Button>
    </form>
  );
}

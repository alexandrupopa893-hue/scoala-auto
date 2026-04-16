"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { saveLessonAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { lessonSchema } from "@/lib/validators";
import type { Instructor, Lesson, Student } from "@/types";

type LessonValues = z.infer<typeof lessonSchema>;

function getDuration(startTime: string, endTime: string) {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

export function LessonForm({
  lesson,
  students,
  instructors,
  onSuccess
}: {
  lesson?: Lesson | null;
  students: Student[];
  instructors: Instructor[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    watch,
    handleSubmit
  } = useForm<LessonValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      id: lesson?.id,
      studentId: lesson?.studentId ?? students[0]?.id ?? "",
      instructorId: lesson?.instructorId ?? instructors[0]?.id ?? "",
      date: lesson?.date ?? "2026-04-09",
      startTime: lesson?.startTime ?? "09:00",
      endTime: lesson?.endTime ?? "10:30",
      durationMinutes: lesson?.durationMinutes ?? 90,
      status: lesson?.status ?? "scheduled",
      notes: lesson?.notes ?? ""
    }
  });

  const startTime = watch("startTime");
  const endTime = watch("endTime");

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveLessonAction({
            ...values,
            durationMinutes: getDuration(values.startTime, values.endTime)
          });
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
          <Label htmlFor="studentId">Student</Label>
          <Select id="studentId" {...register("studentId")}>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="instructorId">Instructor</Label>
          <Select id="instructorId" {...register("instructorId")}>
            {instructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.fullName}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" {...register("status")}>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="canceled">Canceled</option>
            <option value="missed">Missed</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input id="startTime" type="time" {...register("startTime")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End time</Label>
          <Input id="endTime" type="time" {...register("endTime")} />
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 sm:col-span-2">
          Duration preview: {getDuration(startTime, endTime)} minutes
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : lesson ? "Update lesson" : "Create lesson"}
      </Button>
    </form>
  );
}

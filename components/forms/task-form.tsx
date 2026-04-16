"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { saveTaskAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { taskSchema } from "@/lib/validators";
import type { AppUser, Student, Task } from "@/types";

type TaskValues = z.infer<typeof taskSchema>;

export function TaskForm({
  task,
  students,
  users,
  onSuccess
}: {
  task?: Task | null;
  students: Student[];
  users: AppUser[];
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit } = useForm<TaskValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      id: task?.id,
      title: task?.title ?? "",
      relatedStudentId: task?.relatedStudentId ?? "",
      assignedTo: task?.assignedTo ?? users[0]?.id ?? "",
      dueDate: task?.dueDate ?? "2026-04-09",
      priority: task?.priority ?? "medium",
      status: task?.status ?? "pending",
      description: task?.description ?? ""
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) =>
        startTransition(async () => {
          const result = await saveTaskAction({
            ...values,
            relatedStudentId: values.relatedStudentId || null
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
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register("title")} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="relatedStudentId">Related student</Label>
            <Select id="relatedStudentId" {...register("relatedStudentId")}>
              <option value="">No student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assigned to</Label>
            <Select id="assignedTo" {...register("assignedTo")}>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select id="priority" {...register("priority")}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register("description")} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : task ? "Update task" : "Create task"}
      </Button>
    </form>
  );
}

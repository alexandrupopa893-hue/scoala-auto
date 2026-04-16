import { Plus } from "lucide-react";

import { FormSheet } from "@/components/forms/form-sheet";
import { TaskForm } from "@/components/forms/task-form";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { TaskCompleteButton } from "@/components/shared/task-complete-button";
import { TasksTable } from "@/components/tables/tasks-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireCurrentUser } from "@/lib/auth/session";
import { getEnrichedTasks, getEnrichedStudents, getUsers } from "@/lib/data/tenant-repository";
import { formatDate } from "@/lib/utils";

export default async function TasksPage() {
  const user = await requireCurrentUser();
  const tasks = getEnrichedTasks(user);
  const students = getEnrichedStudents(user);
  const users = getUsers(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tasks & Reminders"
        title="Keep follow-ups from slipping through the cracks"
        description="Use lightweight internal reminders for calls, documents, scheduling confirmations, and unpaid balances."
        actions={
          <FormSheet
            title="Create reminder"
            description="Assign a task to the office or instructional team."
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                New task
              </Button>
            }
          >
            <TaskForm students={students} users={users} />
          </FormSheet>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>Pending Today</CardTitle>
            <p className="text-sm text-slate-500">Fast actions that keep operations tidy before the day ends.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks
              .filter((task) => task.status === "pending")
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{task.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Due {formatDate(task.dueDate)}
                        {task.relatedStudent ? ` • ${task.relatedStudent.fullName}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={task.priority} />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{task.description}</p>
                  <div className="mt-4">
                    <TaskCompleteButton taskId={task.id} />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <TasksTable tasks={tasks} />
      </div>
    </div>
  );
}

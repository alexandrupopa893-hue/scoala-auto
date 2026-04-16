import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import type { EnrichedTask } from "@/types";

export function TaskListCard({ tasks }: { tasks: EnrichedTask[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Upcoming Tasks</CardTitle>
          <p className="mt-1 text-sm text-slate-500">Critical follow-ups that keep the school moving.</p>
        </div>
        <Link href="/tasks" className="text-sm font-medium text-teal-700">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-950">{task.title}</p>
              <p className="mt-1 text-sm text-slate-500">
                Due {formatDate(task.dueDate)}{task.relatedStudent ? ` • ${task.relatedStudent.fullName}` : ""}
              </p>
            </div>
            <StatusBadge status={task.priority} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

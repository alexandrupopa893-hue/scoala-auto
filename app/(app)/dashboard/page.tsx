import { Banknote, CalendarCheck2, GraduationCap, UserRoundPlus, Users } from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { StatsChartCard } from "@/components/dashboard/stats-chart-card";
import { UpcomingLessonsCard } from "@/components/dashboard/upcoming-lessons-card";
import { PageHeader } from "@/components/shared/page-header";
import { QuickActions } from "@/components/shared/quick-actions";
import { TaskListCard } from "@/components/shared/task-list-card";
import { getDashboardSnapshot } from "@/lib/data/tenant-repository";
import { requireCurrentUser } from "@/lib/auth/session";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const snapshot = getDashboardSnapshot(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations Dashboard"
        title="Driving school performance at a glance"
        description="Keep students moving, instructors aligned, and office work under control from one premium control room."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Students"
          value={String(snapshot.totalStudents)}
          subtitle={`${snapshot.activeStudents} active right now`}
          icon={Users}
        />
        <KpiCard
          title="Leads"
          value={String(snapshot.leads)}
          subtitle="Fresh demand needing follow-up"
          icon={UserRoundPlus}
        />
        <KpiCard
          title="Today’s Lessons"
          value={String(snapshot.todaysLessons)}
          subtitle={`${snapshot.upcomingLessons} upcoming lesson slots`}
          icon={CalendarCheck2}
        />
        <KpiCard
          title="Revenue Collected"
          value={formatCurrency(snapshot.revenueCollected)}
          subtitle={`${formatCurrency(snapshot.unpaidBalances)} still outstanding`}
          icon={Banknote}
        />
      </div>

      <StatsChartCard revenueSeries={snapshot.revenueSeries} statusDistribution={snapshot.statusDistribution} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <QuickActions user={user} />
        <TaskListCard tasks={snapshot.upcomingTasks} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <UpcomingLessonsCard lessons={snapshot.upcomingLessonsList} />
        <RecentActivityCard items={snapshot.recentActivity} />
      </div>

      <div className="rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(15,118,110,0.94))] p-8 text-white shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-200">Demo-ready value</p>
            <h2 className="mt-3 text-3xl font-semibold">A strong CRM story for real driving schools</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              This MVP focuses on the operational pain points schools actually feel: student visibility,
              scheduling accuracy, payment tracking, document completeness, and faster admin coordination.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-white/10 p-3">
                <GraduationCap className="h-6 w-6 text-teal-200" />
              </div>
              <div>
                <p className="text-sm text-slate-200">Completed students</p>
                <p className="text-2xl font-semibold">{snapshot.completedStudents}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

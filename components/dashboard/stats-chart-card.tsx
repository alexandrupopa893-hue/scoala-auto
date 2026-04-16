"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, toSentenceCase } from "@/lib/utils";

const colors = ["#0f766e", "#0284c7", "#f59e0b", "#ef4444", "#64748b", "#10b981"];

export function StatsChartCard({
  revenueSeries,
  statusDistribution
}: {
  revenueSeries: Array<{ label: string; revenue: number; balance: number }>;
  statusDistribution: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Outstanding Balance</CardTitle>
          <p className="text-sm text-slate-500">A simple six-period view of cash collected versus unpaid value.</p>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="balance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  borderRadius: 16,
                  borderColor: "#e2e8f0",
                  boxShadow: "0 20px 40px -20px rgba(15,23,42,0.24)"
                }}
              />
              <Area type="monotone" dataKey="balance" stroke="#f59e0b" fill="url(#balance)" strokeWidth={2} />
              <Area type="monotone" dataKey="revenue" stroke="#0f766e" fill="url(#revenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Status Mix</CardTitle>
          <p className="text-sm text-slate-500">Snapshot of where the current cohort sits in the journey.</p>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr] xl:grid-cols-1">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={56}
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={entry.label} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value} students`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {statusDistribution.map((item, index) => (
              <div key={item.label} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm font-medium text-slate-700">{toSentenceCase(item.label)}</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

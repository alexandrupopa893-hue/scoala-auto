import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { ActivityItem } from "@/types";

export function RecentActivityCard({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-slate-500">A quick operational feed across office, scheduling, and payments.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-950">{item.title}</p>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.type}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <p className="mt-3 text-xs text-slate-500">{formatDateTime(item.timestamp)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { statusLabelMap } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const variantMap: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  new: "info",
  contacted: "warning",
  interested: "info",
  converted: "success",
  lost: "danger",
  enrolled: "info",
  theory_in_progress: "warning",
  practical_in_progress: "info",
  exam_scheduled: "warning",
  completed: "success",
  inactive: "danger",
  active: "success",
  scheduled: "info",
  canceled: "danger",
  missed: "warning",
  paid: "success",
  partial: "warning",
  unpaid: "danger",
  pending: "warning",
  low: "neutral",
  medium: "info",
  high: "danger"
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={variantMap[status] ?? "neutral"}>{statusLabelMap[status] ?? status}</Badge>;
}

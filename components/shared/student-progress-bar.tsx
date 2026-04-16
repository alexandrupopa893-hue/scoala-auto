import { Progress } from "@/components/ui/progress";
import { clampPercentage } from "@/lib/utils";

export function StudentProgressBar({
  completedHours,
  totalRequiredPracticalHours
}: {
  completedHours: number;
  totalRequiredPracticalHours: number;
}) {
  const percent = clampPercentage((completedHours / totalRequiredPracticalHours) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">Practical progress</span>
        <span className="text-slate-500">
          {completedHours}/{totalRequiredPracticalHours} hours
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}

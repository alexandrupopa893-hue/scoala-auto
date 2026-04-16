import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  className?: string;
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-teal-700 text-sm font-semibold text-white",
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}

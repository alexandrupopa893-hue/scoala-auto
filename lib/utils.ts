import { clsx, type ClassValue } from "clsx";
import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatDate(value?: string | null, pattern = "dd MMM yyyy") {
  if (!value) {
    return "Not set";
  }

  return format(parseISO(value), pattern);
}

export function formatDateTime(value: string) {
  return format(parseISO(value), "dd MMM yyyy, HH:mm");
}

export function formatPhone(value: string) {
  return value.replace(/(\+40)(\d{3})(\d{3})(\d{3})/, "$1 $2 $3 $4");
}

export function formatTimeRange(start: string, end: string) {
  return `${start} - ${end}`;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getWeekRangeLabel(referenceDate: string) {
  const date = parseISO(referenceDate);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

  return `${format(weekStart, "dd MMM")} - ${format(weekEnd, "dd MMM")}`;
}

export function toSentenceCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

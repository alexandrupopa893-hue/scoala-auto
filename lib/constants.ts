import type {
  DocumentType,
  LeadStatus,
  LessonStatus,
  PaymentMethod,
  Role,
  StudentStatus,
  TaskPriority,
  TaskStatus
} from "@/types";

export const roleLabels: Record<Role, string> = {
  admin: "Admin",
  instructor: "Instructor",
  staff: "Office Staff"
};

export const leadStatusOptions: LeadStatus[] = ["new", "contacted", "interested", "converted", "lost"];
export const studentStatusOptions: StudentStatus[] = [
  "enrolled",
  "theory_in_progress",
  "practical_in_progress",
  "exam_scheduled",
  "completed",
  "inactive"
];
export const lessonStatusOptions: LessonStatus[] = ["scheduled", "completed", "canceled", "missed"];
export const paymentMethodOptions: PaymentMethod[] = ["card", "bank_transfer", "cash"];
export const documentTypeOptions: DocumentType[] = ["id", "contract", "medical", "theory_certificate", "other"];
export const taskPriorityOptions: TaskPriority[] = ["low", "medium", "high"];
export const taskStatusOptions: TaskStatus[] = ["pending", "completed"];

export const leadSources = ["Facebook", "Referral", "Website", "Walk-in", "Instagram", "TikTok"] as const;
export const courseCategories = ["B", "B automatic", "BE", "C", "C+E"] as const;

export const statusLabelMap: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  interested: "Interested",
  converted: "Converted",
  lost: "Lost",
  enrolled: "Enrolled",
  theory_in_progress: "Theory in Progress",
  practical_in_progress: "Practical in Progress",
  exam_scheduled: "Exam Scheduled",
  completed: "Completed",
  inactive: "Inactive",
  scheduled: "Scheduled",
  canceled: "Canceled",
  missed: "Missed",
  active: "Active",
  paid: "Paid",
  partial: "Partial",
  unpaid: "Unpaid",
  pending: "Pending",
  low: "Low",
  medium: "Medium",
  high: "High",
  card: "Card",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
  id: "ID",
  contract: "Contract",
  medical: "Medical",
  theory_certificate: "Theory Certificate",
  other: "Other"
};

export type Role = "admin" | "instructor" | "staff";

export type LeadStatus = "new" | "contacted" | "interested" | "converted" | "lost";
export type StudentStatus =
  | "enrolled"
  | "theory_in_progress"
  | "practical_in_progress"
  | "exam_scheduled"
  | "completed"
  | "inactive";
export type InstructorStatus = "active" | "inactive";
export type LessonStatus = "scheduled" | "completed" | "canceled" | "missed";
export type PaymentMethod = "card" | "bank_transfer" | "cash";
export type PaymentStatus = "paid" | "partial" | "unpaid";
export type DocumentType = "id" | "contract" | "medical" | "theory_certificate" | "other";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed";
export type NoteEntityType = "student" | "lead" | "lesson";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantScoped {
  organizationId: string;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  phone?: string;
  avatarUrl?: string | null;
  instructorId?: string | null;
}

export interface DemoAccount extends AppUser {
  password: string;
}

export interface Lead extends TenantScoped {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  source: string;
  interestedCategory: string;
  status: LeadStatus;
  notes: string;
  createdAt: string;
}

export interface Instructor extends TenantScoped {
  id: string;
  profileId?: string | null;
  fullName: string;
  phone: string;
  email: string;
  categories: string[];
  status: InstructorStatus;
  bio: string;
  createdAt: string;
}

export interface Student extends TenantScoped {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  category: string;
  enrollmentDate: string;
  assignedInstructorId: string;
  status: StudentStatus;
  totalRequiredPracticalHours: number;
  completedHours: number;
  examDate?: string | null;
  notes: string;
  totalCoursePrice: number;
}

export interface Lesson extends TenantScoped {
  id: string;
  studentId: string;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: LessonStatus;
  notes: string;
}

export interface Payment extends TenantScoped {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

export interface DocumentRecord extends TenantScoped {
  id: string;
  studentId: string;
  title: string;
  type: DocumentType;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Task extends TenantScoped {
  id: string;
  title: string;
  relatedStudentId?: string | null;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
}

export interface Note extends TenantScoped {
  id: string;
  entityType: NoteEntityType;
  entityId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "lead" | "payment" | "lesson" | "task" | "document";
}

export interface EnrichedLead extends Lead {
  notesCount: number;
}

export interface EnrichedStudent extends Student {
  instructor?: Instructor | null;
  totalPaid: number;
  balanceRemaining: number;
  paymentStatus: PaymentStatus;
  documents: DocumentRecord[];
  lessons: Lesson[];
  notesFeed: Note[];
}

export interface EnrichedInstructor extends Instructor {
  assignedStudents: Student[];
  weeklyLessons: Lesson[];
}

export interface EnrichedLesson extends Lesson {
  student?: Student | null;
  instructor?: Instructor | null;
}

export interface EnrichedPayment extends Payment {
  student?: Student | null;
}

export interface EnrichedTask extends Task {
  assignedUser?: AppUser | null;
  relatedStudent?: Student | null;
}

export interface DashboardSnapshot {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  leads: number;
  todaysLessons: number;
  upcomingLessons: number;
  unpaidBalances: number;
  revenueCollected: number;
  revenueSeries: Array<{ label: string; revenue: number; balance: number }>;
  statusDistribution: Array<{ label: string; value: number }>;
  upcomingLessonsList: EnrichedLesson[];
  recentActivity: ActivityItem[];
  upcomingTasks: EnrichedTask[];
}

export interface ActionResult {
  success: boolean;
  message: string;
}

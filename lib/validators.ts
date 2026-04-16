import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const leadSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3),
  phone: z.string().min(8),
  email: z.string().email(),
  source: z.string().min(2),
  interestedCategory: z.string().min(1),
  status: z.enum(["new", "contacted", "interested", "converted", "lost"]),
  notes: z.string().max(1000).optional().default("")
});

export const studentSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3),
  phone: z.string().min(8),
  email: z.string().email(),
  dateOfBirth: z.string().min(1),
  category: z.string().min(1),
  enrollmentDate: z.string().min(1),
  assignedInstructorId: z.string().min(1),
  status: z.enum([
    "enrolled",
    "theory_in_progress",
    "practical_in_progress",
    "exam_scheduled",
    "completed",
    "inactive"
  ]),
  totalRequiredPracticalHours: z.coerce.number().min(1),
  completedHours: z.coerce.number().min(0),
  examDate: z.string().optional().nullable(),
  totalCoursePrice: z.coerce.number().min(1000),
  notes: z.string().max(2000).optional().default("")
});

export const lessonSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1),
  instructorId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  durationMinutes: z.coerce.number().min(30),
  status: z.enum(["scheduled", "completed", "canceled", "missed"]),
  notes: z.string().max(1200).optional().default("")
});

export const paymentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1),
  amount: z.coerce.number().min(1),
  paymentDate: z.string().min(1),
  paymentMethod: z.enum(["card", "bank_transfer", "cash"]),
  notes: z.string().max(1000).optional().default("")
});

export const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  relatedStudentId: z.string().optional().nullable(),
  assignedTo: z.string().min(1),
  dueDate: z.string().min(1),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["pending", "completed"]),
  description: z.string().max(1000).optional().default("")
});

export const noteSchema = z.object({
  entityType: z.enum(["student", "lead", "lesson"]),
  entityId: z.string().min(1),
  content: z.string().min(3).max(1000)
});

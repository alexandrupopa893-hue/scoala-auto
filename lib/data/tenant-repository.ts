import { isSameDay, parseISO } from "date-fns";

import {
  buildRecentActivity,
  demoDocuments,
  demoInstructors,
  demoLeads,
  demoLessons,
  demoOrganizations,
  demoPayments,
  demoReferenceDate,
  demoStudents,
  demoTasks,
  demoNotes,
  getDemoOrganizationById,
  getDemoUsers
} from "@/lib/demo-tenant-data";
import type {
  AppUser,
  DashboardSnapshot,
  DocumentRecord,
  EnrichedInstructor,
  EnrichedLead,
  EnrichedLesson,
  EnrichedPayment,
  EnrichedStudent,
  EnrichedTask,
  Instructor,
  Note,
  Organization,
  PaymentStatus
} from "@/types";

function filterByOrganization<T extends { organizationId: string }>(items: T[], organizationId: string) {
  return items.filter((item) => item.organizationId === organizationId);
}

export function getOrganizations() {
  return demoOrganizations;
}

export function getOrganizationForUser(user: AppUser): Organization | null {
  return getDemoOrganizationById(user.organizationId);
}

export function getUsers(user: AppUser) {
  return filterByOrganization(getDemoUsers(), user.organizationId);
}

export function getInstructors(user: AppUser) {
  return filterByOrganization(demoInstructors, user.organizationId);
}

export function getStudentsForUser(user: AppUser) {
  const organizationStudents = filterByOrganization(demoStudents, user.organizationId);

  if (user.role !== "instructor") {
    return organizationStudents;
  }

  return organizationStudents.filter((student) => student.assignedInstructorId === user.instructorId);
}

export function getLessonsForUser(user: AppUser) {
  const organizationLessons = filterByOrganization(demoLessons, user.organizationId);

  if (user.role !== "instructor") {
    return organizationLessons;
  }

  return organizationLessons.filter((lesson) => lesson.instructorId === user.instructorId);
}

export function getPaymentsForUser(user: AppUser) {
  const organizationPayments = filterByOrganization(demoPayments, user.organizationId);

  if (user.role === "instructor") {
    const studentIds = new Set(getStudentsForUser(user).map((student) => student.id));
    return organizationPayments.filter((payment) => studentIds.has(payment.studentId));
  }

  return organizationPayments;
}

export function getTasksForUser(user: AppUser) {
  const organizationTasks = filterByOrganization(demoTasks, user.organizationId);
  const organizationUser = filterByOrganization(getDemoUsers(), user.organizationId).find(
    (entry) => entry.email === user.email
  );

  if (user.role === "admin") {
    return organizationTasks;
  }

  return organizationTasks.filter((task) => task.assignedTo === user.id || task.assignedTo === organizationUser?.id);
}

export function getLeads(user: AppUser) {
  return filterByOrganization(demoLeads, user.organizationId);
}

export function getStudentPaymentSummary(studentId: string, organizationId: string) {
  const student = filterByOrganization(demoStudents, organizationId).find((entry) => entry.id === studentId)!;
  const paid = filterByOrganization(demoPayments, organizationId)
    .filter((payment) => payment.studentId === studentId)
    .reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = Math.max(student.totalCoursePrice - paid, 0);

  let paymentStatus: PaymentStatus = "unpaid";
  if (remaining === 0) {
    paymentStatus = "paid";
  } else if (paid > 0) {
    paymentStatus = "partial";
  }

  return {
    totalPaid: paid,
    balanceRemaining: remaining,
    paymentStatus
  };
}

export function enrichStudent(student: (typeof demoStudents)[number]): EnrichedStudent {
  const summary = getStudentPaymentSummary(student.id, student.organizationId);
  return {
    ...student,
    instructor:
      filterByOrganization(demoInstructors, student.organizationId).find(
        (instructor) => instructor.id === student.assignedInstructorId
      ) ?? null,
    documents: filterByOrganization(demoDocuments, student.organizationId).filter(
      (document) => document.studentId === student.id
    ),
    lessons: filterByOrganization(demoLessons, student.organizationId).filter(
      (lesson) => lesson.studentId === student.id
    ),
    notesFeed: filterByOrganization(demoNotes, student.organizationId).filter(
      (note) => note.entityType === "student" && note.entityId === student.id
    ),
    ...summary
  };
}

export function enrichLead(lead: (typeof demoLeads)[number]): EnrichedLead {
  return {
    ...lead,
    notesCount: filterByOrganization(demoNotes, lead.organizationId).filter(
      (note) => note.entityType === "lead" && note.entityId === lead.id
    ).length
  };
}

export function enrichLesson(lesson: (typeof demoLessons)[number]): EnrichedLesson {
  return {
    ...lesson,
    student:
      filterByOrganization(demoStudents, lesson.organizationId).find(
        (student) => student.id === lesson.studentId
      ) ?? null,
    instructor:
      filterByOrganization(demoInstructors, lesson.organizationId).find(
        (instructor) => instructor.id === lesson.instructorId
      ) ?? null
  };
}

export function enrichPayment(payment: (typeof demoPayments)[number]): EnrichedPayment {
  return {
    ...payment,
    student:
      filterByOrganization(demoStudents, payment.organizationId).find(
        (student) => student.id === payment.studentId
      ) ?? null
  };
}

export function enrichTask(task: (typeof demoTasks)[number]): EnrichedTask {
  return {
    ...task,
    assignedUser:
      filterByOrganization(getDemoUsers(), task.organizationId).find((user) => user.id === task.assignedTo) ?? null,
    relatedStudent: task.relatedStudentId
      ? filterByOrganization(demoStudents, task.organizationId).find(
          (student) => student.id === task.relatedStudentId
        ) ?? null
      : null
  };
}

export function getStudentById(id: string, user: AppUser) {
  const student = getStudentsForUser(user).find((entry) => entry.id === id);
  return student ? enrichStudent(student) : null;
}

export function getLeadById(id: string, user: AppUser) {
  const lead = getLeads(user).find((entry) => entry.id === id);
  return lead ? enrichLead(lead) : null;
}

export function getInstructorById(id: string, user: AppUser) {
  const instructor = getInstructors(user).find((entry) => entry.id === id);
  if (!instructor) {
    return null;
  }

  return {
    ...instructor,
    assignedStudents: filterByOrganization(demoStudents, instructor.organizationId).filter(
      (student) => student.assignedInstructorId === instructor.id
    ),
    weeklyLessons: filterByOrganization(demoLessons, instructor.organizationId).filter(
      (lesson) => lesson.instructorId === instructor.id
    )
  } satisfies EnrichedInstructor;
}

export function getDocumentsForStudent(studentId: string, organizationId: string): DocumentRecord[] {
  return filterByOrganization(demoDocuments, organizationId).filter((document) => document.studentId === studentId);
}

export function getNotesForEntity(entityType: Note["entityType"], entityId: string, organizationId: string): Note[] {
  return filterByOrganization(demoNotes, organizationId).filter(
    (note) => note.entityType === entityType && note.entityId === entityId
  );
}

export function getDashboardSnapshot(user: AppUser): DashboardSnapshot {
  const students = getStudentsForUser(user);
  const lessons = getLessonsForUser(user);
  const payments = getPaymentsForUser(user);
  const tasks = getTasksForUser(user);
  const today = parseISO(demoReferenceDate);

  const revenueByMonth = new Map<string, { revenue: number; balance: number }>();

  payments.forEach((payment) => {
    const month = payment.paymentDate.slice(0, 7);
    const existing = revenueByMonth.get(month) ?? { revenue: 0, balance: 0 };
    existing.revenue += payment.amount;
    revenueByMonth.set(month, existing);
  });

  students.forEach((student) => {
    const month = student.enrollmentDate.slice(0, 7);
    const existing = revenueByMonth.get(month) ?? { revenue: 0, balance: 0 };
    existing.balance += getStudentPaymentSummary(student.id, student.organizationId).balanceRemaining;
    revenueByMonth.set(month, existing);
  });

  const statusMap = new Map<string, number>();
  students.forEach((student) => {
    statusMap.set(student.status, (statusMap.get(student.status) ?? 0) + 1);
  });

  return {
    totalStudents: students.length,
    activeStudents: students.filter((student) => student.status !== "inactive" && student.status !== "completed").length,
    completedStudents: students.filter((student) => student.status === "completed").length,
    leads: user.role === "instructor" ? 0 : getLeads(user).length,
    todaysLessons: lessons.filter((lesson) => isSameDay(parseISO(lesson.date), today)).length,
    upcomingLessons: lessons.filter((lesson) => parseISO(lesson.date) >= today && lesson.status === "scheduled").length,
    unpaidBalances: students.reduce(
      (sum, student) => sum + getStudentPaymentSummary(student.id, student.organizationId).balanceRemaining,
      0
    ),
    revenueCollected: payments.reduce((sum, payment) => sum + payment.amount, 0),
    revenueSeries: [...revenueByMonth.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([label, values]) => ({
        label,
        revenue: values.revenue,
        balance: values.balance
      })),
    statusDistribution: [...statusMap.entries()].map(([label, value]) => ({ label, value })),
    upcomingLessonsList: lessons
      .filter((lesson) => parseISO(lesson.date) >= today)
      .slice(0, 6)
      .map(enrichLesson),
    recentActivity: buildRecentActivity(user.organizationId),
    upcomingTasks: tasks
      .filter((task) => task.status === "pending")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5)
      .map(enrichTask)
  };
}

export function getEnrichedStudents(user: AppUser) {
  return getStudentsForUser(user).map(enrichStudent);
}

export function getEnrichedLeads(user: AppUser) {
  return getLeads(user).map(enrichLead);
}

export function getEnrichedLessons(user: AppUser) {
  return getLessonsForUser(user).map(enrichLesson);
}

export function getEnrichedPayments(user: AppUser) {
  return getPaymentsForUser(user).map(enrichPayment);
}

export function getEnrichedTasks(user: AppUser) {
  return getTasksForUser(user).map(enrichTask);
}

export function getEnrichedInstructors(user: AppUser) {
  return getInstructors(user).map((instructor) => ({
    ...instructor,
    assignedStudents: filterByOrganization(demoStudents, instructor.organizationId).filter(
      (student) => student.assignedInstructorId === instructor.id
    ),
    weeklyLessons: filterByOrganization(demoLessons, instructor.organizationId).filter(
      (lesson) => lesson.instructorId === instructor.id
    )
  }));
}

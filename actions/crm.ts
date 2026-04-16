"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/auth/session";
import { demoInstructors, demoLeads, demoLessons, demoPayments, demoStudents, demoTasks, demoUsers } from "@/lib/demo-tenant-data";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  leadSchema,
  lessonSchema,
  noteSchema,
  paymentSchema,
  studentSchema,
  taskSchema
} from "@/lib/validators";
import type { ActionResult, Lesson } from "@/types";

function actionResult(success: boolean, message: string): ActionResult {
  return { success, message };
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(endA) > timeToMinutes(startB);
}

function hasLessonConflict(currentLessons: Lesson[], draft: Pick<Lesson, "id" | "date" | "startTime" | "endTime" | "studentId" | "instructorId">) {
  return currentLessons.some((lesson) => {
    if (lesson.id === draft.id || lesson.date !== draft.date || lesson.status === "canceled") {
      return false;
    }

    const sameStudent = lesson.studentId === draft.studentId;
    const sameInstructor = lesson.instructorId === draft.instructorId;

    return (sameStudent || sameInstructor) && overlaps(lesson.startTime, lesson.endTime, draft.startTime, draft.endTime);
  });
}

async function recordExistsInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  table: string,
  id: string,
  organizationId: string
) {
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("id", id)
    .eq("organization_id", organizationId)
    .maybeSingle();

  return !error && Boolean(data);
}

async function findRecordIdByEmailInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  table: string,
  email: string,
  organizationId: string
) {
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("organization_id", organizationId)
    .eq("email", email)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.id ?? null;
}

async function resolveStudentIdInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  studentId: string,
  organizationId: string
) {
  if (await recordExistsInOrganization(supabase, "students", studentId, organizationId)) {
    return studentId;
  }

  const demoStudent = demoStudents.find((student) => student.id === studentId && student.organizationId === organizationId);
  if (!demoStudent) {
    return null;
  }

  return findRecordIdByEmailInOrganization(supabase, "students", demoStudent.email, organizationId);
}

async function resolveInstructorIdInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  instructorId: string,
  organizationId: string
) {
  if (await recordExistsInOrganization(supabase, "instructors", instructorId, organizationId)) {
    return instructorId;
  }

  const demoInstructor = demoInstructors.find(
    (instructor) => instructor.id === instructorId && instructor.organizationId === organizationId
  );
  if (!demoInstructor) {
    return null;
  }

  return findRecordIdByEmailInOrganization(supabase, "instructors", demoInstructor.email, organizationId);
}

async function resolveLeadIdInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  leadId: string,
  organizationId: string
) {
  if (await recordExistsInOrganization(supabase, "leads", leadId, organizationId)) {
    return leadId;
  }

  const demoLead = demoLeads.find((lead) => lead.id === leadId && lead.organizationId === organizationId);
  if (!demoLead) {
    return null;
  }

  return findRecordIdByEmailInOrganization(supabase, "leads", demoLead.email, organizationId);
}

async function resolveProfileIdInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  profileId: string,
  organizationId: string
) {
  if (await recordExistsInOrganization(supabase, "profiles", profileId, organizationId)) {
    return profileId;
  }

  const demoUser = demoUsers.find((user) => user.id === profileId && user.organizationId === organizationId);
  if (!demoUser) {
    return null;
  }

  return findRecordIdByEmailInOrganization(supabase, "profiles", demoUser.email, organizationId);
}

async function resolveLessonIdInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  lessonId: string,
  organizationId: string
) {
  if (await recordExistsInOrganization(supabase, "lessons", lessonId, organizationId)) {
    return lessonId;
  }

  const demoLesson = demoLessons.find((lesson) => lesson.id === lessonId && lesson.organizationId === organizationId);
  if (!demoLesson) {
    return null;
  }

  const resolvedStudentId = await resolveStudentIdInOrganization(supabase, demoLesson.studentId, organizationId);
  if (!resolvedStudentId) {
    return null;
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("student_id", resolvedStudentId)
    .eq("lesson_date", demoLesson.date)
    .eq("start_time", demoLesson.startTime)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.id ?? null;
}

async function resolvePaymentIdInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  paymentId: string,
  organizationId: string
) {
  if (await recordExistsInOrganization(supabase, "payments", paymentId, organizationId)) {
    return paymentId;
  }

  const demoPayment = demoPayments.find((payment) => payment.id === paymentId && payment.organizationId === organizationId);
  if (!demoPayment) {
    return null;
  }

  const resolvedStudentId = await resolveStudentIdInOrganization(supabase, demoPayment.studentId, organizationId);
  if (!resolvedStudentId) {
    return null;
  }

  const { data, error } = await supabase
    .from("payments")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("student_id", resolvedStudentId)
    .eq("payment_date", demoPayment.paymentDate)
    .eq("amount", demoPayment.amount)
    .eq("payment_method", demoPayment.paymentMethod)
    .maybeSingle();

  if (error) {
    return null;
  }

  return data?.id ?? null;
}

async function resolveTaskIdInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  taskId: string,
  organizationId: string
) {
  if (await recordExistsInOrganization(supabase, "tasks", taskId, organizationId)) {
    return taskId;
  }

  const demoTask = demoTasks.find((task) => task.id === taskId && task.organizationId === organizationId);
  if (!demoTask) {
    return null;
  }

  const resolvedAssigneeId = await resolveProfileIdInOrganization(supabase, demoTask.assignedTo, organizationId);
  const query = supabase
    .from("tasks")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("title", demoTask.title)
    .eq("due_date", demoTask.dueDate);

  const { data, error } = resolvedAssigneeId
    ? await query.eq("assigned_to", resolvedAssigneeId).maybeSingle()
    : await query.maybeSingle();

  if (error) {
    return null;
  }

  return data?.id ?? null;
}

async function noteEntityExistsInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  entityType: "student" | "lead" | "lesson",
  entityId: string,
  organizationId: string
) {
  const tableByEntityType = {
    student: "students",
    lead: "leads",
    lesson: "lessons"
  } as const;

  return recordExistsInOrganization(supabase, tableByEntityType[entityType], entityId, organizationId);
}

async function resolveNoteEntityIdInOrganization(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  entityType: "student" | "lead" | "lesson",
  entityId: string,
  organizationId: string
) {
  switch (entityType) {
    case "student":
      return resolveStudentIdInOrganization(supabase, entityId, organizationId);
    case "lead":
      return resolveLeadIdInOrganization(supabase, entityId, organizationId);
    case "lesson":
      return resolveLessonIdInOrganization(supabase, entityId, organizationId);
    default:
      return null;
  }
}

function demoRecordExistsInOrganization(table: "students" | "instructors" | "profiles", id: string, organizationId: string) {
  if (table === "students") {
    return demoStudents.some((student) => student.id === id && student.organizationId === organizationId);
  }

  if (table === "instructors") {
    return demoInstructors.some((instructor) => instructor.id === id && instructor.organizationId === organizationId);
  }

  return demoUsers.some((user) => user.id === id && user.organizationId === organizationId);
}

export async function saveLeadAction(input: unknown): Promise<ActionResult> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return actionResult(false, "Lead form is incomplete.");
  }

  const currentUser = await requireCurrentUser();

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const resolvedLeadId = parsed.data.id
      ? await resolveLeadIdInOrganization(supabase, parsed.data.id, currentUser.organizationId)
      : null;
    const payload = {
      organization_id: currentUser.organizationId,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      source: parsed.data.source,
      interested_category: parsed.data.interestedCategory,
      status: parsed.data.status,
      notes: parsed.data.notes ?? ""
    };

    const { error } = resolvedLeadId
      ? await supabase
          .from("leads")
          .update(payload)
          .eq("id", resolvedLeadId)
          .eq("organization_id", currentUser.organizationId)
      : await supabase.from("leads").insert(payload);

    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/leads");
  return actionResult(true, "Lead saved successfully.");
}

export async function convertLeadAction(leadId: string): Promise<ActionResult> {
  if (!leadId) {
    return actionResult(false, "Missing lead.");
  }

  const currentUser = await requireCurrentUser();

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const resolvedLeadId = await resolveLeadIdInOrganization(supabase, leadId, currentUser.organizationId);

    if (!resolvedLeadId) {
      return actionResult(false, "Lead not found.");
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", resolvedLeadId)
      .eq("organization_id", currentUser.organizationId)
      .maybeSingle();

    if (leadError || !lead) {
      return actionResult(false, leadError?.message ?? "Lead not found.");
    }

    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        organization_id: currentUser.organizationId,
        full_name: lead.full_name,
        phone: lead.phone,
        email: lead.email,
        date_of_birth: "2000-01-01",
        category: lead.interested_category,
        enrollment_date: new Date().toISOString().slice(0, 10),
        status: "enrolled",
        total_required_practical_hours: 30,
        completed_practical_hours: 0,
        total_course_price: 4500,
        notes: lead.notes ?? ""
      })
      .select("id")
      .single();

    if (studentError || !student) {
      return actionResult(false, studentError?.message ?? "Student could not be created.");
    }

    const { error: updateError } = await supabase
      .from("leads")
      .update({ status: "converted", converted_student_id: student.id })
      .eq("id", resolvedLeadId)
      .eq("organization_id", currentUser.organizationId);

    if (updateError) {
      return actionResult(false, updateError.message);
    }
  }

  revalidatePath("/leads");
  revalidatePath("/students");
  return actionResult(true, "Lead converted into student profile.");
}

export async function deleteLeadAction(leadId: string): Promise<ActionResult> {
  if (!leadId) {
    return actionResult(false, "Missing lead.");
  }

  const currentUser = await requireCurrentUser();

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const resolvedLeadId = await resolveLeadIdInOrganization(supabase, leadId, currentUser.organizationId);

    if (!resolvedLeadId) {
      return actionResult(false, "Lead not found.");
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", resolvedLeadId)
      .eq("organization_id", currentUser.organizationId);

    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/leads");
  return actionResult(true, "Lead deleted.");
}

export async function saveStudentAction(input: unknown): Promise<ActionResult> {
  const parsed = studentSchema.safeParse(input);
  if (!parsed.success) {
    return actionResult(false, "Student form is incomplete.");
  }

  const currentUser = await requireCurrentUser();

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const resolvedStudentId = parsed.data.id
      ? await resolveStudentIdInOrganization(supabase, parsed.data.id, currentUser.organizationId)
      : null;
    const resolvedInstructorId = parsed.data.assignedInstructorId
      ? await resolveInstructorIdInOrganization(supabase, parsed.data.assignedInstructorId, currentUser.organizationId)
      : null;

    if (parsed.data.assignedInstructorId && !resolvedInstructorId) {
      return actionResult(false, "Assigned instructor does not belong to your organization.");
    }

    const payload = {
      organization_id: currentUser.organizationId,
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      email: parsed.data.email,
      date_of_birth: parsed.data.dateOfBirth,
      category: parsed.data.category,
      enrollment_date: parsed.data.enrollmentDate,
      assigned_instructor_id: resolvedInstructorId,
      status: parsed.data.status,
      total_required_practical_hours: parsed.data.totalRequiredPracticalHours,
      completed_practical_hours: parsed.data.completedHours,
      exam_date: parsed.data.examDate || null,
      total_course_price: parsed.data.totalCoursePrice,
      notes: parsed.data.notes ?? ""
    };

    const { error } = resolvedStudentId
      ? await supabase
          .from("students")
          .update(payload)
          .eq("id", resolvedStudentId)
          .eq("organization_id", currentUser.organizationId)
      : await supabase.from("students").insert(payload);

    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/students");
  return actionResult(true, "Student saved successfully.");
}

export async function saveLessonAction(input: unknown): Promise<ActionResult> {
  const parsed = lessonSchema.safeParse(input);
  if (!parsed.success) {
    return actionResult(false, "Lesson form is incomplete.");
  }

  const currentUser = await requireCurrentUser();
  const organizationLessons = demoLessons.filter((lesson) => lesson.organizationId === currentUser.organizationId);

  if (!demoRecordExistsInOrganization("students", parsed.data.studentId, currentUser.organizationId)) {
    return actionResult(false, "Selected student does not belong to your organization.");
  }

  if (!demoRecordExistsInOrganization("instructors", parsed.data.instructorId, currentUser.organizationId)) {
    return actionResult(false, "Selected instructor does not belong to your organization.");
  }

  if (hasLessonConflict(organizationLessons, { ...parsed.data, id: parsed.data.id ?? "" })) {
    return actionResult(false, "This lesson overlaps with an existing booking for the student or instructor.");
  }

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const [resolvedStudentId, resolvedInstructorId, resolvedLessonId] = await Promise.all([
      resolveStudentIdInOrganization(supabase, parsed.data.studentId, currentUser.organizationId),
      resolveInstructorIdInOrganization(supabase, parsed.data.instructorId, currentUser.organizationId),
      parsed.data.id ? resolveLessonIdInOrganization(supabase, parsed.data.id, currentUser.organizationId) : null
    ]);

    if (!resolvedStudentId) {
      return actionResult(false, "Selected student does not belong to your organization.");
    }

    if (!resolvedInstructorId) {
      return actionResult(false, "Selected instructor does not belong to your organization.");
    }

    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, student_id, instructor_id, lesson_date, start_time, end_time, status")
      .eq("organization_id", currentUser.organizationId);

    const normalizedLessons: Lesson[] =
      lessons?.map((lesson) => ({
        id: lesson.id,
        organizationId: currentUser.organizationId,
        studentId: lesson.student_id,
        instructorId: lesson.instructor_id,
        date: lesson.lesson_date,
        startTime: lesson.start_time,
        endTime: lesson.end_time,
        durationMinutes: 0,
        status: lesson.status,
        notes: ""
      })) ?? [];

    if (
      hasLessonConflict(normalizedLessons, {
        ...parsed.data,
        id: resolvedLessonId ?? parsed.data.id ?? "",
        studentId: resolvedStudentId,
        instructorId: resolvedInstructorId
      })
    ) {
      return actionResult(false, "Scheduling conflict detected in Supabase.");
    }

    const payload = {
      organization_id: currentUser.organizationId,
      student_id: resolvedStudentId,
      instructor_id: resolvedInstructorId,
      lesson_date: parsed.data.date,
      start_time: parsed.data.startTime,
      end_time: parsed.data.endTime,
      duration_minutes: parsed.data.durationMinutes,
      status: parsed.data.status,
      notes: parsed.data.notes ?? ""
    };

    const { error } = resolvedLessonId
      ? await supabase
          .from("lessons")
          .update(payload)
          .eq("id", resolvedLessonId)
          .eq("organization_id", currentUser.organizationId)
      : await supabase.from("lessons").insert(payload);

    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/schedule");
  return actionResult(true, "Lesson saved successfully.");
}

export async function updateLessonStatusAction(
  lessonId: string,
  status: "completed" | "canceled" | "missed" | "scheduled"
): Promise<ActionResult> {
  if (!lessonId) {
    return actionResult(false, "Missing lesson.");
  }

  const currentUser = await requireCurrentUser();

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const resolvedLessonId = await resolveLessonIdInOrganization(supabase, lessonId, currentUser.organizationId);

    if (!resolvedLessonId) {
      return actionResult(false, "Lesson not found.");
    }

    const { error } = await supabase
      .from("lessons")
      .update({ status })
      .eq("id", resolvedLessonId)
      .eq("organization_id", currentUser.organizationId);
    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  return actionResult(true, `Lesson marked as ${status.replace("_", " ")}.`);
}

export async function savePaymentAction(input: unknown): Promise<ActionResult> {
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) {
    return actionResult(false, "Payment form is incomplete.");
  }

  const currentUser = await requireCurrentUser();

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const resolvedStudentId = await resolveStudentIdInOrganization(supabase, parsed.data.studentId, currentUser.organizationId);
    const resolvedPaymentId = parsed.data.id
      ? await resolvePaymentIdInOrganization(supabase, parsed.data.id, currentUser.organizationId)
      : null;

    if (!resolvedStudentId) {
      return actionResult(false, "Selected student does not belong to your organization.");
    }

    const payload = {
      organization_id: currentUser.organizationId,
      student_id: resolvedStudentId,
      amount: parsed.data.amount,
      payment_date: parsed.data.paymentDate,
      payment_method: parsed.data.paymentMethod,
      notes: parsed.data.notes ?? ""
    };

    const { error } = resolvedPaymentId
      ? await supabase
          .from("payments")
          .update(payload)
          .eq("id", resolvedPaymentId)
          .eq("organization_id", currentUser.organizationId)
      : await supabase.from("payments").insert(payload);

    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/payments");
  revalidatePath("/students");
  return actionResult(true, "Payment recorded successfully.");
}

export async function saveTaskAction(input: unknown): Promise<ActionResult> {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return actionResult(false, "Task form is incomplete.");
  }

  const currentUser = await requireCurrentUser();

  if (
    parsed.data.relatedStudentId &&
    !demoRecordExistsInOrganization("students", parsed.data.relatedStudentId, currentUser.organizationId)
  ) {
    return actionResult(false, "Related student does not belong to your organization.");
  }

  if (!demoRecordExistsInOrganization("profiles", parsed.data.assignedTo, currentUser.organizationId)) {
    return actionResult(false, "Assigned user does not belong to your organization.");
  }

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const [resolvedStudentId, resolvedAssigneeId, resolvedTaskId] = await Promise.all([
      parsed.data.relatedStudentId
        ? resolveStudentIdInOrganization(supabase, parsed.data.relatedStudentId, currentUser.organizationId)
        : Promise.resolve(true),
      resolveProfileIdInOrganization(supabase, parsed.data.assignedTo, currentUser.organizationId),
      parsed.data.id ? resolveTaskIdInOrganization(supabase, parsed.data.id, currentUser.organizationId) : null
    ]);

    if (!resolvedStudentId) {
      return actionResult(false, "Related student does not belong to your organization.");
    }

    if (!resolvedAssigneeId) {
      return actionResult(false, "Assigned user does not belong to your organization.");
    }

    const payload = {
      organization_id: currentUser.organizationId,
      title: parsed.data.title,
      related_student_id: typeof resolvedStudentId === "string" ? resolvedStudentId : null,
      assigned_to: resolvedAssigneeId,
      due_date: parsed.data.dueDate,
      priority: parsed.data.priority,
      status: parsed.data.status,
      description: parsed.data.description ?? "",
      created_by: currentUser.id
    };

    const { error } = resolvedTaskId
      ? await supabase
          .from("tasks")
          .update(payload)
          .eq("id", resolvedTaskId)
          .eq("organization_id", currentUser.organizationId)
      : await supabase.from("tasks").insert(payload);

    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/tasks");
  return actionResult(true, "Task saved successfully.");
}

export async function markTaskCompletedAction(taskId: string): Promise<ActionResult> {
  if (!taskId) {
    return actionResult(false, "Missing task.");
  }

  const currentUser = await requireCurrentUser();

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const resolvedTaskId = await resolveTaskIdInOrganization(supabase, taskId, currentUser.organizationId);

    if (!resolvedTaskId) {
      return actionResult(false, "Task not found.");
    }

    const { error } = await supabase
      .from("tasks")
      .update({ status: "completed" })
      .eq("id", resolvedTaskId)
      .eq("organization_id", currentUser.organizationId);
    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return actionResult(true, "Task marked as completed.");
}

export async function saveNoteAction(input: unknown): Promise<ActionResult> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) {
    return actionResult(false, "Note is invalid.");
  }

  const currentUser = await requireCurrentUser();

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const resolvedEntityId = await resolveNoteEntityIdInOrganization(
      supabase,
      parsed.data.entityType,
      parsed.data.entityId,
      currentUser.organizationId
    );

    if (!resolvedEntityId) {
      return actionResult(false, "You can only add notes to records inside your organization.");
    }

    const entityExists = await noteEntityExistsInOrganization(
      supabase,
      parsed.data.entityType,
      resolvedEntityId,
      currentUser.organizationId
    );

    if (!entityExists) {
      return actionResult(false, "You can only add notes to records inside your organization.");
    }

    const { error } = await supabase.from("notes").insert({
      organization_id: currentUser.organizationId,
      entity_type: parsed.data.entityType,
      entity_id: resolvedEntityId,
      author_id: currentUser.id,
      content: parsed.data.content
    });

    if (error) {
      return actionResult(false, error.message);
    }
  }

  revalidatePath("/students");
  revalidatePath("/leads");
  return actionResult(true, "Note added successfully.");
}

export async function uploadStudentDocumentAction(formData: FormData): Promise<ActionResult> {
  const studentId = String(formData.get("studentId") || "");
  const title = String(formData.get("title") || "");
  const type = String(formData.get("type") || "");
  const file = formData.get("file");

  if (!studentId || !title || !type || !(file instanceof File)) {
    return actionResult(false, "Please complete the document form.");
  }

  const currentUser = await requireCurrentUser();

  if (!isSupabaseConfigured()) {
    if (!demoRecordExistsInOrganization("students", studentId, currentUser.organizationId)) {
      return actionResult(false, "Selected student does not belong to your organization.");
    }

    revalidatePath("/students");
    return actionResult(true, "Document captured in demo mode. Connect Supabase storage to persist files.");
  }

  const supabase = await createServerSupabaseClient();
  const resolvedStudentId = await resolveStudentIdInOrganization(supabase, studentId, currentUser.organizationId);

  if (!resolvedStudentId) {
    return actionResult(false, "Selected student does not belong to your organization.");
  }

  const extension = file.name.split(".").pop() || "pdf";
  const filePath = `${currentUser.organizationId}/students/${resolvedStudentId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("student-documents")
    .upload(filePath, file, { upsert: false, contentType: file.type || "application/pdf" });

  if (uploadError) {
    return actionResult(false, uploadError.message);
  }

  const { error: insertError } = await supabase.from("documents").insert({
    organization_id: currentUser.organizationId,
    student_id: resolvedStudentId,
    title,
    document_type: type,
    file_name: `${title}.${extension}`,
    file_path: filePath,
    uploaded_by: currentUser.id
  });

  if (insertError) {
    return actionResult(false, insertError.message);
  }

  revalidatePath("/students");
  return actionResult(true, "Document uploaded successfully.");
}

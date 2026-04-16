import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

import {
  demoDocuments,
  demoInstructors,
  demoLeads,
  demoLessons,
  demoNotes,
  demoOrganizations,
  demoPayments,
  demoStudents,
  demoTasks,
  demoUsers
} from "../lib/demo-tenant-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function ensureAuthUser(account: (typeof demoUsers)[number]) {
  const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200
  });

  if (listError) {
    throw listError;
  }

  const existing = listed.users.find((user) => user.email === account.email);

  if (existing) {
    await supabase.auth.admin.updateUserById(existing.id, {
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName }
    });
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { full_name: account.fullName }
  });

  if (error || !data.user) {
    throw error ?? new Error(`Could not create user for ${account.email}`);
  }

  return data.user.id;
}

async function clearTable(table: string) {
  const { error } = await supabase.from(table).delete().not("id", "is", null);
  if (error) {
    throw error;
  }
}

async function run() {
  console.log("Seeding DriveFlow CRM with multi-tenant demo data...");

  const authIdMap = new Map<string, string>();
  for (const account of demoUsers) {
    const authId = await ensureAuthUser(account);
    authIdMap.set(account.id, authId);
  }

  const organizationRows = demoOrganizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    created_at: organization.createdAt,
    updated_at: organization.updatedAt
  }));

  const { error: organizationsError } = await supabase.from("organizations").upsert(organizationRows);
  if (organizationsError) {
    throw organizationsError;
  }

  const profileRows = demoUsers.map((account) => ({
    id: authIdMap.get(account.id)!,
    organization_id: account.organizationId,
    full_name: account.fullName,
    email: account.email,
    role: account.role,
    phone: account.phone ?? null
  }));

  const { error: profilesError } = await supabase.from("profiles").upsert(profileRows);
  if (profilesError) {
    throw profilesError;
  }

  await clearTable("notes");
  await clearTable("tasks");
  await clearTable("documents");
  await clearTable("payments");
  await clearTable("lessons");
  await clearTable("leads");
  await clearTable("students");
  await clearTable("instructors");

  const instructorIdMap = new Map<string, string>();
  for (const instructor of demoInstructors) {
    const { data, error } = await supabase
      .from("instructors")
      .insert({
        organization_id: instructor.organizationId,
        profile_id: instructor.profileId ? authIdMap.get(instructor.profileId) : null,
        full_name: instructor.fullName,
        phone: instructor.phone,
        email: instructor.email,
        categories: instructor.categories,
        status: instructor.status,
        bio: instructor.bio,
        created_at: instructor.createdAt
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error(`Failed to insert instructor ${instructor.fullName}`);
    }

    instructorIdMap.set(instructor.id, data.id);
  }

  const studentIdMap = new Map<string, string>();
  for (const student of demoStudents) {
    const { data, error } = await supabase
      .from("students")
      .insert({
        organization_id: student.organizationId,
        full_name: student.fullName,
        phone: student.phone,
        email: student.email,
        date_of_birth: student.dateOfBirth,
        category: student.category,
        enrollment_date: student.enrollmentDate,
        assigned_instructor_id: instructorIdMap.get(student.assignedInstructorId) ?? null,
        status: student.status,
        total_required_practical_hours: student.totalRequiredPracticalHours,
        completed_practical_hours: student.completedHours,
        exam_date: student.examDate ?? null,
        total_course_price: student.totalCoursePrice,
        notes: student.notes
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error(`Failed to insert student ${student.fullName}`);
    }

    studentIdMap.set(student.id, data.id);
  }

  const leadIdMap = new Map<string, string>();
  for (const lead of demoLeads) {
    const { data, error } = await supabase
      .from("leads")
      .insert({
        organization_id: lead.organizationId,
        full_name: lead.fullName,
        phone: lead.phone,
        email: lead.email,
        source: lead.source,
        interested_category: lead.interestedCategory,
        status: lead.status,
        notes: lead.notes,
        created_at: lead.createdAt
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error(`Failed to insert lead ${lead.fullName}`);
    }

    leadIdMap.set(lead.id, data.id);
  }

  const lessonIdMap = new Map<string, string>();
  for (const lesson of demoLessons) {
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        organization_id: lesson.organizationId,
        student_id: studentIdMap.get(lesson.studentId)!,
        instructor_id: instructorIdMap.get(lesson.instructorId)!,
        lesson_date: lesson.date,
        start_time: lesson.startTime,
        end_time: lesson.endTime,
        duration_minutes: lesson.durationMinutes,
        status: lesson.status,
        notes: lesson.notes
      })
      .select("id")
      .single();

    if (error || !data) {
      throw error ?? new Error("Failed to insert lesson.");
    }

    lessonIdMap.set(lesson.id, data.id);
  }

  for (const payment of demoPayments) {
    const { error } = await supabase.from("payments").insert({
      organization_id: payment.organizationId,
      student_id: studentIdMap.get(payment.studentId)!,
      amount: payment.amount,
      payment_date: payment.paymentDate,
      payment_method: payment.paymentMethod,
      notes: payment.notes
    });

    if (error) {
      throw error;
    }
  }

  for (const document of demoDocuments) {
    const { error } = await supabase.from("documents").insert({
      organization_id: document.organizationId,
      student_id: studentIdMap.get(document.studentId)!,
      title: document.title,
      document_type: document.type,
      file_name: document.fileName,
      file_path: document.filePath,
      uploaded_by: authIdMap.get(document.uploadedBy) ?? null,
      uploaded_at: document.uploadedAt
    });

    if (error) {
      throw error;
    }
  }

  const adminByOrganizationId = new Map(
    demoUsers.filter((user) => user.role === "admin").map((user) => [user.organizationId, authIdMap.get(user.id)!])
  );

  for (const task of demoTasks) {
    const { error } = await supabase.from("tasks").insert({
      organization_id: task.organizationId,
      title: task.title,
      description: task.description,
      related_student_id: task.relatedStudentId ? studentIdMap.get(task.relatedStudentId) : null,
      assigned_to: authIdMap.get(task.assignedTo) ?? null,
      due_date: task.dueDate,
      priority: task.priority,
      status: task.status,
      created_by: adminByOrganizationId.get(task.organizationId) ?? null
    });

    if (error) {
      throw error;
    }
  }

  for (const note of demoNotes) {
    let entityId: string | undefined;

    if (note.entityType === "student") {
      entityId = studentIdMap.get(note.entityId);
    }

    if (note.entityType === "lesson") {
      entityId = lessonIdMap.get(note.entityId);
    }

    if (note.entityType === "lead") {
      entityId = leadIdMap.get(note.entityId);
    }

    if (!entityId) {
      continue;
    }

    const { error } = await supabase.from("notes").insert({
      organization_id: note.organizationId,
      entity_type: note.entityType,
      entity_id: entityId,
      author_id: authIdMap.get(note.authorId) ?? null,
      content: note.content,
      created_at: note.createdAt
    });

    if (error) {
      throw error;
    }
  }

  console.log("Multi-tenant seed completed successfully.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

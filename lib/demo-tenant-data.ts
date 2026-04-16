import { addDays, format, parseISO } from "date-fns";

import type {
  ActivityItem,
  AppUser,
  DemoAccount,
  DocumentRecord,
  Instructor,
  Lead,
  Lesson,
  Note,
  Organization,
  Payment,
  Student,
  StudentStatus,
  Task
} from "@/types";

export const demoReferenceDate = "2026-04-09";

const ORG_ONE_ID = "11111111-1111-4111-8111-111111111111";
const ORG_TWO_ID = "22222222-2222-4222-8222-222222222222";

export const demoOrganizations: Organization[] = [
  {
    id: ORG_ONE_ID,
    name: "AutoDrive Pro",
    slug: "autodrive-pro",
    createdAt: "2025-01-01",
    updatedAt: "2026-04-09"
  },
  {
    id: ORG_TWO_ID,
    name: "Urban Drive Academy",
    slug: "urban-drive-academy",
    createdAt: "2025-01-04",
    updatedAt: "2026-04-09"
  }
];

const organizationById = Object.fromEntries(demoOrganizations.map((organization) => [organization.id, organization]));

function makeEmail(name: string, domain: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/(^\.|\.$)/g, "") + `@${domain}`
  );
}

function getOrganizationName(organizationId: string) {
  return organizationById[organizationId]?.name ?? "Organization";
}

function getOrganizationSlug(organizationId: string) {
  return organizationById[organizationId]?.slug ?? "organization";
}

export const demoUsers: DemoAccount[] = [
  {
    id: "user-admin",
    fullName: "Andrei Popescu",
    email: "admin@autodrivepro.ro",
    password: "DriveDemo123!",
    role: "admin",
    organizationId: ORG_ONE_ID,
    organizationName: getOrganizationName(ORG_ONE_ID),
    organizationSlug: getOrganizationSlug(ORG_ONE_ID),
    phone: "+40740111222"
  },
  {
    id: "user-staff",
    fullName: "Elena Ionescu",
    email: "office@autodrivepro.ro",
    password: "DriveDemo123!",
    role: "staff",
    organizationId: ORG_ONE_ID,
    organizationName: getOrganizationName(ORG_ONE_ID),
    organizationSlug: getOrganizationSlug(ORG_ONE_ID),
    phone: "+40740222333"
  },
  {
    id: "user-inst-1",
    fullName: "Mihai Radu",
    email: "mihai.radu@autodrivepro.ro",
    password: "DriveDemo123!",
    role: "instructor",
    organizationId: ORG_ONE_ID,
    organizationName: getOrganizationName(ORG_ONE_ID),
    organizationSlug: getOrganizationSlug(ORG_ONE_ID),
    phone: "+40740333444",
    instructorId: "inst-1"
  },
  {
    id: "user-inst-2",
    fullName: "Sorin Dumitrescu",
    email: "sorin.dumitrescu@autodrivepro.ro",
    password: "DriveDemo123!",
    role: "instructor",
    organizationId: ORG_ONE_ID,
    organizationName: getOrganizationName(ORG_ONE_ID),
    organizationSlug: getOrganizationSlug(ORG_ONE_ID),
    phone: "+40740444555",
    instructorId: "inst-2"
  },
  {
    id: "user-admin-2",
    fullName: "Mara Georgescu",
    email: "admin@urbandrive.ro",
    password: "DriveDemo123!",
    role: "admin",
    organizationId: ORG_TWO_ID,
    organizationName: getOrganizationName(ORG_TWO_ID),
    organizationSlug: getOrganizationSlug(ORG_TWO_ID),
    phone: "+40741122334"
  },
  {
    id: "user-staff-2",
    fullName: "Diana Ilie",
    email: "office@urbandrive.ro",
    password: "DriveDemo123!",
    role: "staff",
    organizationId: ORG_TWO_ID,
    organizationName: getOrganizationName(ORG_TWO_ID),
    organizationSlug: getOrganizationSlug(ORG_TWO_ID),
    phone: "+40741233445"
  },
  {
    id: "user-inst-3",
    fullName: "Ioana Marin",
    email: "ioana.marin@urbandrive.ro",
    password: "DriveDemo123!",
    role: "instructor",
    organizationId: ORG_TWO_ID,
    organizationName: getOrganizationName(ORG_TWO_ID),
    organizationSlug: getOrganizationSlug(ORG_TWO_ID),
    phone: "+40740555666",
    instructorId: "inst-3"
  },
  {
    id: "user-inst-4",
    fullName: "Vlad Tudor",
    email: "vlad.tudor@urbandrive.ro",
    password: "DriveDemo123!",
    role: "instructor",
    organizationId: ORG_TWO_ID,
    organizationName: getOrganizationName(ORG_TWO_ID),
    organizationSlug: getOrganizationSlug(ORG_TWO_ID),
    phone: "+40740666777",
    instructorId: "inst-4"
  }
];

const instructorOrganizationIdMap: Record<string, string> = {
  "inst-1": ORG_ONE_ID,
  "inst-2": ORG_ONE_ID,
  "inst-3": ORG_TWO_ID,
  "inst-4": ORG_TWO_ID
};

const primaryAdminByOrganizationId: Record<string, string> = {
  [ORG_ONE_ID]: "user-admin",
  [ORG_TWO_ID]: "user-admin-2"
};

const primaryStaffByOrganizationId: Record<string, string> = {
  [ORG_ONE_ID]: "user-staff",
  [ORG_TWO_ID]: "user-staff-2"
};

export const demoInstructors: Instructor[] = [
  {
    id: "inst-1",
    profileId: "user-inst-1",
    organizationId: ORG_ONE_ID,
    fullName: "Mihai Radu",
    phone: "+40740333444",
    email: "mihai.radu@autodrivepro.ro",
    categories: ["B", "B automatic", "BE"],
    status: "active",
    bio: "Calm urban-driving specialist with a strong pass-rate for first-time learners.",
    createdAt: "2025-01-10"
  },
  {
    id: "inst-2",
    profileId: "user-inst-2",
    organizationId: ORG_ONE_ID,
    fullName: "Sorin Dumitrescu",
    phone: "+40740444555",
    email: "sorin.dumitrescu@autodrivepro.ro",
    categories: ["B", "C", "C+E"],
    status: "active",
    bio: "Strong on exam preparation, route planning, and confidence-building for hesitant students.",
    createdAt: "2025-01-11"
  },
  {
    id: "inst-3",
    profileId: "user-inst-3",
    organizationId: ORG_TWO_ID,
    fullName: "Ioana Marin",
    phone: "+40740555666",
    email: "ioana.marin@urbandrive.ro",
    categories: ["B", "B automatic", "BE"],
    status: "active",
    bio: "Known for structured lesson progression and clear written feedback after every drive.",
    createdAt: "2025-01-14"
  },
  {
    id: "inst-4",
    profileId: "user-inst-4",
    organizationId: ORG_TWO_ID,
    fullName: "Vlad Tudor",
    phone: "+40740666777",
    email: "vlad.tudor@urbandrive.ro",
    categories: ["B", "C", "C+E"],
    status: "active",
    bio: "Heavy-vehicle instructor with a practical, checklist-driven approach to route readiness.",
    createdAt: "2025-01-16"
  }
];

const studentBlueprints = [
  ["Ana-Maria Stan", "B", "inst-1", "practical_in_progress", 30, 18, "2026-05-12", 4600],
  ["Bogdan Enache", "B", "inst-2", "theory_in_progress", 30, 6, null, 4500],
  ["Carla Munteanu", "B automatic", "inst-3", "exam_scheduled", 30, 28, "2026-04-23", 4700],
  ["Darius Pavel", "C", "inst-4", "practical_in_progress", 42, 20, null, 6200],
  ["Elena Mocanu", "B", "inst-2", "completed", 30, 30, "2026-03-28", 4550],
  ["Florin Petrescu", "B", "inst-1", "enrolled", 30, 0, null, 4500],
  ["Gabriela Neagu", "BE", "inst-3", "practical_in_progress", 36, 14, null, 5200],
  ["Horia Barbu", "C", "inst-4", "exam_scheduled", 42, 40, "2026-04-18", 6500],
  ["Ioana Matei", "B", "inst-2", "practical_in_progress", 30, 12, null, 4600],
  ["Raluca Stoica", "B automatic", "inst-1", "theory_in_progress", 30, 4, null, 4700],
  ["Tudor Nistor", "C+E", "inst-4", "enrolled", 42, 0, null, 7200],
  ["Bianca Lupu", "B", "inst-3", "completed", 30, 30, "2026-03-16", 4450],
  ["Cristian Popa", "B", "inst-2", "practical_in_progress", 30, 17, null, 4600],
  ["Daniela Dobre", "B", "inst-1", "inactive", 30, 8, null, 4550],
  ["Eduard Marin", "C", "inst-4", "practical_in_progress", 42, 24, null, 6350],
  ["Georgiana Badea", "B", "inst-3", "exam_scheduled", 30, 29, "2026-04-29", 4520],
  ["Ionut Toma", "B", "inst-2", "practical_in_progress", 30, 19, null, 4680],
  ["Larisa Preda", "B", "inst-1", "theory_in_progress", 30, 5, null, 4500],
  ["Marius Oprea", "C", "inst-4", "completed", 42, 42, "2026-03-30", 6400],
  ["Nicoleta Sandu", "B automatic", "inst-3", "practical_in_progress", 30, 15, null, 4700],
  ["Octavian Ilie", "B", "inst-2", "exam_scheduled", 30, 27, "2026-05-05", 4500],
  ["Paula Zaharia", "BE", "inst-3", "enrolled", 36, 0, null, 5300],
  ["Robert Enescu", "B", "inst-1", "practical_in_progress", 30, 21, null, 4600],
  ["Simona Pirvu", "B", "inst-2", "completed", 30, 30, "2026-03-21", 4520],
  ["Teodor Vasile", "C+E", "inst-4", "theory_in_progress", 42, 10, null, 7100]
] as const;

function getStudentOrganizationId(assignedInstructorId: string) {
  return instructorOrganizationIdMap[assignedInstructorId] ?? ORG_ONE_ID;
}

export const demoStudents: Student[] = studentBlueprints.map(
  ([fullName, category, assignedInstructorId, status, totalRequiredPracticalHours, completedHours, examDate, totalCoursePrice], index) => ({
    id: `student-${index + 1}`,
    organizationId: getStudentOrganizationId(assignedInstructorId),
    fullName,
    phone: `+4075${(index + 11).toString().padStart(2, "0")}${(index + 37).toString().padStart(2, "0")}${(index + 53)
      .toString()
      .padStart(2, "0")}`,
    email: makeEmail(fullName, index % 3 === 0 ? "gmail.com" : index % 3 === 1 ? "yahoo.com" : "outlook.com"),
    dateOfBirth: format(addDays(parseISO("1997-02-14"), index * 91), "yyyy-MM-dd"),
    category,
    enrollmentDate: format(addDays(parseISO("2025-11-10"), index * 5), "yyyy-MM-dd"),
    assignedInstructorId,
    status: status as StudentStatus,
    totalRequiredPracticalHours,
    completedHours,
    examDate,
    notes:
      index % 4 === 0
        ? "Needs proactive follow-up on lesson rhythm and exam confidence."
        : "Responsive student with steady progress and good scheduling flexibility.",
    totalCoursePrice
  })
);

const studentById = Object.fromEntries(demoStudents.map((student) => [student.id, student]));

const paymentCoverageByStatus: Record<StudentStatus, number> = {
  enrolled: 0.2,
  theory_in_progress: 0.35,
  practical_in_progress: 0.6,
  exam_scheduled: 0.85,
  completed: 1,
  inactive: 0.45
};

function splitAmounts(total: number, count: number) {
  if (count === 1) {
    return [total];
  }

  const first = Math.round(total * 0.4);
  const second = Math.round(total * 0.35);
  const third = total - first - second;

  return count === 2 ? [first, total - first] : [first, second, third];
}

export const demoPayments: Payment[] = demoStudents.flatMap((student, index) => {
  const paidAmount = Math.round(student.totalCoursePrice * paymentCoverageByStatus[student.status]);
  if (paidAmount <= 0) {
    return [];
  }

  const count = paidAmount > student.totalCoursePrice * 0.75 ? 3 : paidAmount > student.totalCoursePrice * 0.4 ? 2 : 1;
  const chunks = splitAmounts(paidAmount, count);

  return chunks.map((amount, chunkIndex) => ({
    id: `payment-${student.id}-${chunkIndex + 1}`,
    organizationId: student.organizationId,
    studentId: student.id,
    amount,
    paymentDate: format(
      addDays(parseISO(student.enrollmentDate), 3 + chunkIndex * 16 + (index % 5)),
      "yyyy-MM-dd"
    ),
    paymentMethod: (["card", "bank_transfer", "cash"] as const)[(index + chunkIndex) % 3],
    notes: chunkIndex === 0 ? "Enrollment payment received." : "Scheduled installment collected on time."
  }));
});

export const demoDocuments: DocumentRecord[] = demoStudents.slice(0, 10).flatMap((student, index) => {
  const uploader =
    index % 2 === 0
      ? primaryStaffByOrganizationId[student.organizationId]
      : primaryAdminByOrganizationId[student.organizationId];

  const docs: DocumentRecord[] = [
    {
      id: `document-${student.id}-contract`,
      organizationId: student.organizationId,
      studentId: student.id,
      title: "Training contract",
      type: "contract",
      fileName: `${student.fullName.replaceAll(" ", "-").toLowerCase()}-contract.pdf`,
      filePath: `${student.organizationId}/students/${student.id}/contract.pdf`,
      uploadedAt: format(addDays(parseISO(student.enrollmentDate), 1), "yyyy-MM-dd"),
      uploadedBy: uploader
    },
    {
      id: `document-${student.id}-id`,
      organizationId: student.organizationId,
      studentId: student.id,
      title: "Identity document",
      type: "id",
      fileName: `${student.fullName.replaceAll(" ", "-").toLowerCase()}-id.pdf`,
      filePath: `${student.organizationId}/students/${student.id}/id.pdf`,
      uploadedAt: format(addDays(parseISO(student.enrollmentDate), 2), "yyyy-MM-dd"),
      uploadedBy: uploader
    }
  ];

  if (index % 2 === 0) {
    docs.push({
      id: `document-${student.id}-medical`,
      organizationId: student.organizationId,
      studentId: student.id,
      title: "Medical certificate",
      type: "medical",
      fileName: `${student.fullName.replaceAll(" ", "-").toLowerCase()}-medical.pdf`,
      filePath: `${student.organizationId}/students/${student.id}/medical.pdf`,
      uploadedAt: format(addDays(parseISO(student.enrollmentDate), 7), "yyyy-MM-dd"),
      uploadedBy: uploader
    });
  }

  return docs;
});

const lessonBlueprints = [
  ["student-1", "2026-04-06", "08:30", "10:00", "completed", "Urban traffic practice and parking refinement."],
  ["student-3", "2026-04-06", "10:15", "11:45", "completed", "Reverse parking and lane selection before exam."],
  ["student-4", "2026-04-06", "12:00", "14:00", "completed", "Truck route positioning and hazard anticipation."],
  ["student-9", "2026-04-06", "14:15", "15:45", "completed", "Roundabout confidence and smoother clutch work."],
  ["student-7", "2026-04-07", "08:30", "10:00", "completed", "Trailer coupling basics and mirror routine."],
  ["student-13", "2026-04-07", "10:15", "11:45", "completed", "Mock exam route with city-center pressure points."],
  ["student-15", "2026-04-07", "12:15", "14:15", "completed", "Inclines, braking distances, and loading awareness."],
  ["student-17", "2026-04-07", "14:30", "16:00", "missed", "Student missed lesson without prior confirmation."],
  ["student-20", "2026-04-08", "09:00", "10:30", "completed", "Automatic gearbox control and tight-turn practice."],
  ["student-23", "2026-04-08", "10:45", "12:15", "completed", "Parallel parking and route memorisation."],
  ["student-8", "2026-04-08", "12:30", "14:30", "completed", "Final heavy-vehicle prep before scheduled exam."],
  ["student-18", "2026-04-08", "15:00", "16:30", "canceled", "Canceled due to student theory mock test conflict."],
  ["student-1", "2026-04-09", "09:00", "10:30", "scheduled", "Downtown traffic decision-making and lane timing."],
  ["student-11", "2026-04-09", "10:45", "12:45", "scheduled", "Initial heavy-vehicle orientation and yard maneuvers."],
  ["student-3", "2026-04-09", "13:00", "14:30", "scheduled", "Exam route polishing and confidence feedback."],
  ["student-21", "2026-04-09", "15:00", "16:30", "scheduled", "Mock exam with independent navigation prompts."],
  ["student-6", "2026-04-10", "08:30", "10:00", "scheduled", "First practical lesson and pre-drive checklist."],
  ["student-10", "2026-04-10", "10:15", "11:45", "scheduled", "Theory-to-practice transition with automatic controls."],
  ["student-16", "2026-04-10", "12:00", "13:30", "scheduled", "Parking consistency and last-mile exam prep."],
  ["student-22", "2026-04-10", "14:00", "15:30", "scheduled", "Trailer handling fundamentals and mirror positioning."],
  ["student-24", "2026-04-11", "09:00", "10:30", "scheduled", "Confidence-building lesson before certificate pickup."],
  ["student-25", "2026-04-11", "11:00", "13:00", "scheduled", "Route discipline and heavy-vehicle signaling review."],
  ["student-14", "2026-04-11", "14:00", "15:30", "scheduled", "Return-to-training assessment after attendance gap."],
  ["student-19", "2026-04-12", "10:00", "12:00", "scheduled", "Post-license refresher on advanced freight maneuvers."]
] as const;

export const demoLessons: Lesson[] = lessonBlueprints.map(
  ([studentId, date, startTime, endTime, status, notes], index) => {
    const student = studentById[studentId];
    const start = Number(startTime.split(":")[0]) * 60 + Number(startTime.split(":")[1]);
    const end = Number(endTime.split(":")[0]) * 60 + Number(endTime.split(":")[1]);

    return {
      id: `lesson-${index + 1}`,
      organizationId: student.organizationId,
      studentId,
      instructorId: student.assignedInstructorId,
      date,
      startTime,
      endTime,
      durationMinutes: end - start,
      status,
      notes
    };
  }
);

export const demoLeads: Lead[] = [
  {
    id: "lead-1",
    organizationId: ORG_ONE_ID,
    fullName: "Alexandra Gheorghe",
    phone: "+40745888121",
    email: "alexandra.gheorghe@gmail.com",
    source: "Facebook",
    interestedCategory: "B",
    status: "new",
    notes: "Asked about evening slots and installment options.",
    createdAt: "2026-04-08"
  },
  {
    id: "lead-2",
    organizationId: ORG_ONE_ID,
    fullName: "Ciprian Sandu",
    phone: "+40745888122",
    email: "ciprian.sandu@gmail.com",
    source: "Referral",
    interestedCategory: "C",
    status: "contacted",
    notes: "Interested in weekend lessons because of work shifts.",
    createdAt: "2026-04-07"
  },
  {
    id: "lead-3",
    organizationId: ORG_ONE_ID,
    fullName: "Denisa Pavel",
    phone: "+40745888123",
    email: "denisa.pavel@gmail.com",
    source: "Website",
    interestedCategory: "B automatic",
    status: "interested",
    notes: "Asked for female instructor availability.",
    createdAt: "2026-04-06"
  },
  {
    id: "lead-4",
    organizationId: ORG_ONE_ID,
    fullName: "Emil Rusu",
    phone: "+40745888124",
    email: "emil.rusu@gmail.com",
    source: "Walk-in",
    interestedCategory: "B",
    status: "converted",
    notes: "Visited office and booked onboarding for next Monday.",
    createdAt: "2026-04-04"
  },
  {
    id: "lead-5",
    organizationId: ORG_ONE_ID,
    fullName: "Felicia Dinu",
    phone: "+40745888125",
    email: "felicia.dinu@gmail.com",
    source: "Instagram",
    interestedCategory: "BE",
    status: "new",
    notes: "Needs company invoice later, but okay with manual receipt for now.",
    createdAt: "2026-04-08"
  },
  {
    id: "lead-6",
    organizationId: ORG_TWO_ID,
    fullName: "George Calin",
    phone: "+40745888126",
    email: "george.calin@gmail.com",
    source: "TikTok",
    interestedCategory: "B",
    status: "lost",
    notes: "Chose a closer competitor after price comparison.",
    createdAt: "2026-04-02"
  },
  {
    id: "lead-7",
    organizationId: ORG_TWO_ID,
    fullName: "Ilinca Vaduva",
    phone: "+40745888127",
    email: "ilinca.vaduva@gmail.com",
    source: "Referral",
    interestedCategory: "B",
    status: "contacted",
    notes: "Needs quick start because exam target is in summer.",
    createdAt: "2026-04-05"
  },
  {
    id: "lead-8",
    organizationId: ORG_TWO_ID,
    fullName: "Laurentiu Petcu",
    phone: "+40745888128",
    email: "laurentiu.petcu@gmail.com",
    source: "Website",
    interestedCategory: "C+E",
    status: "interested",
    notes: "Requested breakdown for practical hours and document list.",
    createdAt: "2026-04-07"
  },
  {
    id: "lead-9",
    organizationId: ORG_TWO_ID,
    fullName: "Madalina Onofrei",
    phone: "+40745888129",
    email: "madalina.onofrei@gmail.com",
    source: "Facebook",
    interestedCategory: "B",
    status: "new",
    notes: "Waiting for salary date before enrollment deposit.",
    createdAt: "2026-04-09"
  },
  {
    id: "lead-10",
    organizationId: ORG_TWO_ID,
    fullName: "Paul Serban",
    phone: "+40745888130",
    email: "paul.serban@gmail.com",
    source: "Walk-in",
    interestedCategory: "C",
    status: "interested",
    notes: "Wants intensive schedule and theory support materials.",
    createdAt: "2026-04-03"
  }
];

export const demoTasks: Task[] = [
  {
    id: "task-1",
    organizationId: ORG_ONE_ID,
    title: "Call Alexandra Gheorghe about evening package",
    relatedStudentId: null,
    assignedTo: "user-staff",
    dueDate: "2026-04-09",
    priority: "high",
    status: "pending",
    description: "Confirm lesson slot availability and send payment plan."
  },
  {
    id: "task-2",
    organizationId: ORG_ONE_ID,
    title: "Upload medical certificate for Ana-Maria Stan",
    relatedStudentId: "student-1",
    assignedTo: "user-staff",
    dueDate: "2026-04-10",
    priority: "medium",
    status: "pending",
    description: "Student already sent scan by email. Save it into documents."
  },
  {
    id: "task-3",
    organizationId: ORG_TWO_ID,
    title: "Prepare Carla Munteanu exam checklist",
    relatedStudentId: "student-3",
    assignedTo: "user-inst-3",
    dueDate: "2026-04-09",
    priority: "high",
    status: "pending",
    description: "Review recurring mistakes before official exam route."
  },
  {
    id: "task-4",
    organizationId: ORG_TWO_ID,
    title: "Follow up unpaid balance for Darius Pavel",
    relatedStudentId: "student-4",
    assignedTo: "user-admin-2",
    dueDate: "2026-04-11",
    priority: "high",
    status: "pending",
    description: "Balance is overdue by one installment cycle."
  },
  {
    id: "task-5",
    organizationId: ORG_TWO_ID,
    title: "Confirm next week schedule with Tudor Nistor",
    relatedStudentId: "student-11",
    assignedTo: "user-inst-4",
    dueDate: "2026-04-09",
    priority: "medium",
    status: "pending",
    description: "New heavy-vehicle student needs first three slots locked in."
  },
  {
    id: "task-6",
    organizationId: ORG_ONE_ID,
    title: "Archive completed file for Simona Pirvu",
    relatedStudentId: "student-24",
    assignedTo: "user-staff",
    dueDate: "2026-04-12",
    priority: "low",
    status: "completed",
    description: "Move contract and certificate into completed-student folder."
  },
  {
    id: "task-7",
    organizationId: ORG_ONE_ID,
    title: "Convert Emil Rusu into enrolled student",
    relatedStudentId: null,
    assignedTo: "user-admin",
    dueDate: "2026-04-09",
    priority: "medium",
    status: "completed",
    description: "Payment and onboarding documents are already ready."
  },
  {
    id: "task-8",
    organizationId: ORG_ONE_ID,
    title: "Review missed lesson for Ionut Toma",
    relatedStudentId: "student-17",
    assignedTo: "user-inst-2",
    dueDate: "2026-04-10",
    priority: "medium",
    status: "pending",
    description: "Call student and reschedule missed practical session."
  },
  {
    id: "task-9",
    organizationId: ORG_ONE_ID,
    title: "Send BE offer to Felicia Dinu",
    relatedStudentId: null,
    assignedTo: "user-staff",
    dueDate: "2026-04-10",
    priority: "low",
    status: "pending",
    description: "Include program timeline and document checklist."
  }
];

export const demoNotes: Note[] = [
  {
    id: "note-1",
    organizationId: ORG_ONE_ID,
    entityType: "student",
    entityId: "student-1",
    authorId: "user-inst-1",
    authorName: "Mihai Radu",
    content: "Improved mirror checks today. Needs more confidence when merging in heavy traffic.",
    createdAt: "2026-04-08T16:40:00"
  },
  {
    id: "note-2",
    organizationId: ORG_TWO_ID,
    entityType: "student",
    entityId: "student-3",
    authorId: "user-inst-3",
    authorName: "Ioana Marin",
    content: "Exam-ready overall. Final lesson should focus only on parking consistency.",
    createdAt: "2026-04-08T18:15:00"
  },
  {
    id: "note-3",
    organizationId: ORG_TWO_ID,
    entityType: "student",
    entityId: "student-4",
    authorId: "user-inst-4",
    authorName: "Vlad Tudor",
    content: "Needs better anticipation at roundabouts with heavy vehicle clearance.",
    createdAt: "2026-04-07T14:50:00"
  },
  {
    id: "note-4",
    organizationId: ORG_ONE_ID,
    entityType: "lead",
    entityId: "lead-1",
    authorId: "user-staff",
    authorName: "Elena Ionescu",
    content: "Asked to be called after 18:00 because of work.",
    createdAt: "2026-04-08T11:00:00"
  },
  {
    id: "note-5",
    organizationId: ORG_TWO_ID,
    entityType: "lead",
    entityId: "lead-8",
    authorId: "user-admin-2",
    authorName: "Mara Georgescu",
    content: "Qualified lead for premium C+E package, likely ready this month.",
    createdAt: "2026-04-07T10:20:00"
  },
  {
    id: "note-6",
    organizationId: ORG_ONE_ID,
    entityType: "lesson",
    entityId: "lesson-8",
    authorId: "user-inst-2",
    authorName: "Sorin Dumitrescu",
    content: "Marked as missed. Student apologized and requested next available evening slot.",
    createdAt: "2026-04-07T16:20:00"
  },
  {
    id: "note-7",
    organizationId: ORG_TWO_ID,
    entityType: "student",
    entityId: "student-11",
    authorId: "user-inst-4",
    authorName: "Vlad Tudor",
    content: "Needs a slow onboarding pace, new to larger vehicles.",
    createdAt: "2026-04-09T08:10:00"
  },
  {
    id: "note-8",
    organizationId: ORG_TWO_ID,
    entityType: "student",
    entityId: "student-22",
    authorId: "user-inst-3",
    authorName: "Ioana Marin",
    content: "Enrollment complete, pending first lesson confirmation for Friday.",
    createdAt: "2026-04-08T13:45:00"
  }
];

export function getDemoUsers(): AppUser[] {
  return demoUsers.map(({ password: _password, ...user }) => user);
}

export function getDemoOrganizationById(organizationId: string) {
  return demoOrganizations.find((organization) => organization.id === organizationId) ?? null;
}

export function buildRecentActivity(organizationId: string): ActivityItem[] {
  const organizationPayments = demoPayments.filter((payment) => payment.organizationId === organizationId);
  const organizationLessons = demoLessons.filter((lesson) => lesson.organizationId === organizationId);
  const organizationDocuments = demoDocuments.filter((document) => document.organizationId === organizationId);
  const organizationTasks = demoTasks.filter((task) => task.organizationId === organizationId);

  const paymentItems: ActivityItem[] = organizationPayments.slice(-4).map((payment) => {
    const student = studentById[payment.studentId];
    return {
      id: `activity-payment-${payment.id}`,
      type: "payment",
      title: `${student.fullName} made a payment`,
      description: `${payment.amount} RON received via ${payment.paymentMethod.replace("_", " ")}.`,
      timestamp: `${payment.paymentDate}T10:00:00`
    };
  });

  const lessonItems: ActivityItem[] = organizationLessons
    .filter((lesson) => lesson.status !== "scheduled")
    .slice(-3)
    .map((lesson) => {
      const student = studentById[lesson.studentId];
      return {
        id: `activity-lesson-${lesson.id}`,
        type: "lesson",
        title: `${student.fullName} lesson ${lesson.status}`,
        description: lesson.notes,
        timestamp: `${lesson.date}T${lesson.endTime}:00`
      };
    });

  const documentItems: ActivityItem[] = organizationDocuments.slice(-2).map((document) => {
    const student = studentById[document.studentId];
    return {
      id: `activity-document-${document.id}`,
      type: "document",
      title: `Document uploaded for ${student.fullName}`,
      description: `${document.title} added to the student file.`,
      timestamp: `${document.uploadedAt}T12:00:00`
    };
  });

  const taskItems: ActivityItem[] = organizationTasks.slice(-2).map((task) => ({
    id: `activity-task-${task.id}`,
    type: "task",
    title: task.title,
    description: task.description,
    timestamp: `${task.dueDate}T09:15:00`
  }));

  return [...paymentItems, ...lessonItems, ...documentItems, ...taskItems]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 8);
}

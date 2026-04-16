"use client";

import Link from "next/link";
import { useState } from "react";

import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { EnrichedStudent, Instructor } from "@/types";

export function StudentsTable({
  students,
  instructors
}: {
  students: EnrichedStudent[];
  instructors: Instructor[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [instructorId, setInstructorId] = useState("all");

  const filtered = students.filter((student) => {
    const matchesQuery =
      !query ||
      student.fullName.toLowerCase().includes(query.toLowerCase()) ||
      student.phone.toLowerCase().includes(query.toLowerCase()) ||
      student.email.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || student.status === status;
    const matchesCategory = category === "all" || student.category === category;
    const matchesInstructor = instructorId === "all" || student.assignedInstructorId === instructorId;
    return matchesQuery && matchesStatus && matchesCategory && matchesInstructor;
  });

  return (
    <div>
      <TableToolbar className="grid gap-3 lg:grid-cols-[1fr,180px,180px,220px]">
        <SearchInput value={query} onChange={setQuery} placeholder="Search student, phone, email..." />
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="enrolled">Enrolled</option>
          <option value="theory_in_progress">Theory in Progress</option>
          <option value="practical_in_progress">Practical in Progress</option>
          <option value="exam_scheduled">Exam Scheduled</option>
          <option value="completed">Completed</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {[...new Set(students.map((student) => student.category))].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select value={instructorId} onChange={(event) => setInstructorId(event.target.value)}>
          <option value="all">All instructors</option>
          {instructors.map((instructor) => (
            <option key={instructor.id} value={instructor.id}>
              {instructor.fullName}
            </option>
          ))}
        </Select>
      </TableToolbar>

      <div className="rounded-3xl border border-white/60 bg-white/80 shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Exam Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <Link href={`/students/${student.id}`} className="block">
                    <p className="font-semibold text-slate-950">{student.fullName}</p>
                    <p className="text-sm text-slate-500">{student.phone}</p>
                  </Link>
                </TableCell>
                <TableCell>{student.category}</TableCell>
                <TableCell>{student.instructor?.fullName}</TableCell>
                <TableCell>
                  <StatusBadge status={student.status} />
                </TableCell>
                <TableCell>
                  {student.completedHours}/{student.totalRequiredPracticalHours}
                </TableCell>
                <TableCell>
                  <StatusBadge status={student.paymentStatus} />
                </TableCell>
                <TableCell>{formatDate(student.examDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

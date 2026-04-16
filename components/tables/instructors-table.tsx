"use client";

import Link from "next/link";
import { useState } from "react";

import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { EnrichedInstructor } from "@/types";

export function InstructorsTable({ instructors }: { instructors: EnrichedInstructor[] }) {
  const [query, setQuery] = useState("");

  const filtered = instructors.filter((instructor) => {
    return (
      !query ||
      instructor.fullName.toLowerCase().includes(query.toLowerCase()) ||
      instructor.email.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div>
      <TableToolbar>
        <SearchInput value={query} onChange={setQuery} placeholder="Search instructor..." />
      </TableToolbar>

      <div className="rounded-3xl border border-white/60 bg-white/80 shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Instructor</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Weekly Lessons</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell>
                  <Link href={`/instructors/${instructor.id}`} className="block">
                    <p className="font-semibold text-slate-950">{instructor.fullName}</p>
                    <p className="text-sm text-slate-500">{instructor.email}</p>
                  </Link>
                </TableCell>
                <TableCell>{instructor.categories.join(", ")}</TableCell>
                <TableCell>{instructor.assignedStudents.length}</TableCell>
                <TableCell>{instructor.weeklyLessons.length}</TableCell>
                <TableCell>
                  <StatusBadge status={instructor.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

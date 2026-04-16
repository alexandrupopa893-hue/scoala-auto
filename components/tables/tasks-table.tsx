"use client";

import { useState } from "react";

import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { EnrichedTask } from "@/types";

export function TasksTable({ tasks }: { tasks: EnrichedTask[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = tasks.filter((task) => {
    const matchesQuery =
      !query ||
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      task.description.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || task.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <TableToolbar>
        <SearchInput value={query} onChange={setQuery} placeholder="Search task..." />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full sm:w-[180px]">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </Select>
      </TableToolbar>

      <div className="rounded-3xl border border-white/60 bg-white/80 shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <p className="font-medium text-slate-950">{task.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{task.description}</p>
                </TableCell>
                <TableCell>{task.relatedStudent?.fullName ?? "—"}</TableCell>
                <TableCell>{task.assignedUser?.fullName}</TableCell>
                <TableCell>{formatDate(task.dueDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={task.priority} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={task.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

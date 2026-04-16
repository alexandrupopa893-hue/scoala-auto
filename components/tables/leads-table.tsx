"use client";

import Link from "next/link";
import { useState } from "react";

import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { EnrichedLead } from "@/types";

export function LeadsTable({ leads }: { leads: EnrichedLead[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = leads.filter((lead) => {
    const matchesQuery =
      !query ||
      lead.fullName.toLowerCase().includes(query.toLowerCase()) ||
      lead.phone.toLowerCase().includes(query.toLowerCase()) ||
      lead.email.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || lead.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      <TableToolbar>
        <SearchInput value={query} onChange={setQuery} placeholder="Search lead, phone, email..." />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full sm:w-[180px]">
          <option value="all">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="interested">Interested</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </Select>
      </TableToolbar>

      <div className="rounded-3xl border border-white/60 bg-white/80 shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Link href={`/leads/${lead.id}`} className="block">
                    <p className="font-semibold text-slate-950">{lead.fullName}</p>
                    <p className="text-sm text-slate-500">{lead.email}</p>
                  </Link>
                </TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{lead.interestedCategory}</TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell>{lead.notesCount}</TableCell>
                <TableCell>{formatDate(lead.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

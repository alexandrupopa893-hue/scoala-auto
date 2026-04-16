"use client";

import { useState } from "react";

import { SearchInput } from "@/components/shared/search-input";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableToolbar } from "@/components/shared/table-toolbar";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EnrichedPayment } from "@/types";

export function PaymentsTable({ payments }: { payments: EnrichedPayment[] }) {
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState("all");

  const filtered = payments.filter((payment) => {
    const matchesQuery =
      !query ||
      (payment.student?.fullName ?? "").toLowerCase().includes(query.toLowerCase()) ||
      payment.notes.toLowerCase().includes(query.toLowerCase());
    const matchesMethod = method === "all" || payment.paymentMethod === method;
    return matchesQuery && matchesMethod;
  });

  return (
    <div>
      <TableToolbar>
        <SearchInput value={query} onChange={setQuery} placeholder="Search payment or student..." />
        <Select value={method} onChange={(event) => setMethod(event.target.value)} className="w-full sm:w-[180px]">
          <option value="all">All methods</option>
          <option value="card">Card</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="cash">Cash</option>
        </Select>
      </TableToolbar>

      <div className="rounded-3xl border border-white/60 bg-white/80 shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <p className="font-medium text-slate-950">{payment.student?.fullName}</p>
                </TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                <TableCell>
                  <StatusBadge status={payment.paymentMethod} />
                </TableCell>
                <TableCell>{payment.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

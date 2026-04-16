"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";

import { uploadStudentDocumentAction } from "@/actions/crm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import type { DocumentRecord } from "@/types";

export function DocumentUploader({
  studentId,
  documents
}: {
  studentId: string;
  documents: DocumentRecord[];
}) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <p className="text-sm text-slate-500">Keep contracts, IDs, and certificates easy to find.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <form
          ref={formRef}
          className="grid gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 md:grid-cols-[1.1fr,0.8fr,1fr,auto]"
          action={(formData) => {
            startTransition(async () => {
              const result = await uploadStudentDocumentAction(formData);
              if (result.success) {
                toast.success(result.message);
                formRef.current?.reset();
              } else {
                toast.error(result.message);
              }
            });
          }}
        >
          <input type="hidden" name="studentId" value={studentId} />
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" placeholder="Medical certificate" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select id="type" name="type" defaultValue="contract">
              <option value="contract">Contract</option>
              <option value="id">ID</option>
              <option value="medical">Medical</option>
              <option value="theory_certificate">Theory certificate</option>
              <option value="other">Other</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" name="file" type="file" />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4">
              <div>
                <p className="font-medium text-slate-950">{document.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {document.fileName} • Uploaded {formatDate(document.uploadedAt)}
                </p>
              </div>
              <a
                href={document.filePath}
                className="text-sm font-semibold text-teal-700"
                target="_blank"
                rel="noreferrer"
              >
                Preview
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

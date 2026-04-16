import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, RefreshCcw } from "lucide-react";

import { convertLeadAction } from "@/actions/crm";
import { LeadForm } from "@/components/forms/lead-form";
import { NoteComposer } from "@/components/forms/note-composer";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { LeadDeleteButton } from "@/components/shared/lead-delete-button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ensureRouteAccess } from "@/lib/auth/permissions";
import { requireCurrentUser } from "@/lib/auth/session";
import { getLeadById, getNotesForEntity } from "@/lib/data/tenant-repository";
import { formatDate } from "@/lib/utils";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCurrentUser();
  ensureRouteAccess(user.role, "leads");

  const lead = getLeadById(id, user);
  if (!lead) {
    notFound();
  }

  const currentLead = lead;
  const notes = getNotesForEntity("lead", currentLead.id, user.organizationId);

  async function handleConvert() {
    "use server";
    await convertLeadAction(currentLead.id);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lead Detail"
        title={currentLead.fullName}
        description={`Created ${formatDate(lead.createdAt)} • ${lead.source} • ${lead.interestedCategory}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/leads">
                <ArrowLeft className="h-4 w-4" />
                Back to leads
              </Link>
            </Button>
            <form action={handleConvert}>
              <Button type="submit">
                <RefreshCcw className="h-4 w-4" />
                Convert to student
              </Button>
            </form>
            <LeadDeleteButton leadId={lead.id} />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={lead.status} />
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{lead.phone}</div>
              <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{lead.email}</div>
            </div>
            <LeadForm lead={lead} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Internal Notes</h2>
              <p className="mt-1 text-sm text-slate-500">Capture call outcomes, objections, and follow-up context.</p>
            </div>
            <NoteComposer entityType="lead" entityId={lead.id} />
            <ActivityTimeline notes={notes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

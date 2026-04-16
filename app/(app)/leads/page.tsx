import { Plus } from "lucide-react";

import { FormSheet } from "@/components/forms/form-sheet";
import { LeadForm } from "@/components/forms/lead-form";
import { PageHeader } from "@/components/shared/page-header";
import { LeadsTable } from "@/components/tables/leads-table";
import { Button } from "@/components/ui/button";
import { ensureRouteAccess } from "@/lib/auth/permissions";
import { requireCurrentUser } from "@/lib/auth/session";
import { getEnrichedLeads } from "@/lib/data/tenant-repository";

export default async function LeadsPage() {
  const user = await requireCurrentUser();
  ensureRouteAccess(user.role, "leads");
  const leads = getEnrichedLeads(user);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Lead Management"
        title="Track inbound interest before it goes cold"
        description="Keep the pipeline visible, standardise follow-up, and convert more inquiries into enrolled students."
        actions={
          <FormSheet
            title="Create lead"
            description="Capture a new inquiry with enough context for a strong follow-up."
            trigger={
              <Button>
                <Plus className="h-4 w-4" />
                Create lead
              </Button>
            }
          >
            <LeadForm />
          </FormSheet>
        }
      />

      <LeadsTable leads={leads} />
    </div>
  );
}

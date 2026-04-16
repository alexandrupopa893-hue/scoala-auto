import { PageHeader } from "@/components/shared/page-header";
import { InstructorsTable } from "@/components/tables/instructors-table";
import { requireCurrentUser } from "@/lib/auth/session";
import { getEnrichedInstructors } from "@/lib/data/tenant-repository";

export default async function InstructorsPage() {
  const user = await requireCurrentUser();
  const instructors = getEnrichedInstructors(user);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Instructor Management"
        title="Keep instructor workload balanced and visible"
        description="Review teaching categories, assigned student load, and weekly lesson volume from one calm roster."
      />

      <InstructorsTable instructors={instructors} />
    </div>
  );
}

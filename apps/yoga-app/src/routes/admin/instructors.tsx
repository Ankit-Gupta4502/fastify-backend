import { createFileRoute } from "@tanstack/react-router";
import { useAdminInstructors } from "@/hooks/use-admin";
import { InstructorsTable } from "./_components/instructors-table";
import { SectionHeader } from "@/components/shared/section-header";

export const Route = createFileRoute("/admin/instructors")({
  component: AdminInstructorsPage,
});

function AdminInstructorsPage() {
  const { data, isLoading, error } = useAdminInstructors();
  const instructors = data?.data ?? [];

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Admin"
        title="Instructors"
        description="All registered instructors and their availability."
      />
      <InstructorsTable instructors={instructors} isLoading={isLoading} error={error} />
    </div>
  );
}

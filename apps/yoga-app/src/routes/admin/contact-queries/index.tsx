import { createFileRoute } from "@tanstack/react-router";
import type { AdminContactQuery } from "@yoga-app/shared";
import { SectionHeader } from "@/shared/components/misc/section-header";
import { useAdminContactQueries, useAdminResolveContactQuery } from "@/features/contact";
import { ContactQueriesTable } from "@/features/admin/components/contact-queries-table";

export const Route = createFileRoute("/admin/contact-queries/")({
  component: AdminContactQueriesPage,
});

function AdminContactQueriesPage() {
  const { data, isLoading, error } = useAdminContactQueries();
  const resolveQuery = useAdminResolveContactQuery();

  const queries = data?.data ?? [];

  const handleResolve = (query: AdminContactQuery) => {
    resolveQuery.mutate(query.id);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Admin"
        title="Contact Queries"
        description="Messages submitted through the public contact form."
      />

      <ContactQueriesTable
        queries={queries}
        isLoading={isLoading}
        error={error}
        onResolve={handleResolve}
        isResolving={resolveQuery.isPending}
      />
    </div>
  );
}

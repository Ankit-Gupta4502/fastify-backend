import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { AdminDemoRequest } from "@yoga-app/shared";
import { SectionHeader } from "@/shared/components/misc/section-header";
import { useAdminDemoRequests } from "@/features/demo/hooks/use-demo";
import { useAdminInstructors } from "@/features/admin/hooks/use-admin";
import { DemoRequestsTable } from "@/features/admin/components/demo-requests-table";
import { ReviewDemoDialog } from "@/features/admin/components/review-demo-dialog";

export const Route = createFileRoute("/admin/demo-requests/")({
  component: AdminDemoRequestsPage,
});

function AdminDemoRequestsPage() {
  const { data, isLoading, error } = useAdminDemoRequests();
  const { data: instructorsData } = useAdminInstructors();

  const [selected, setSelected] = useState<AdminDemoRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const requests = data?.data ?? [];
  const instructors = instructorsData?.data ?? [];

  const handleReview = (request: AdminDemoRequest) => {
    setSelected(request);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Admin"
        title="Demo Requests"
        description="Review and manage free yoga demo class requests from users."
      />

      <DemoRequestsTable
        requests={requests}
        isLoading={isLoading}
        error={error}
        onReview={handleReview}
      />

      <ReviewDemoDialog
        request={selected}
        instructors={instructors}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}

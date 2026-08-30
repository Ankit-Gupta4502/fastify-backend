import { createFileRoute } from "@tanstack/react-router";
import type { AdminCorporateInquiry } from "@yoga-app/shared";
import { CorporateInquiriesTable } from "@/features/admin/components/corporate-inquiries-table";
import { useAdminCorporateInquiries, useAdminResolveCorporateInquiry } from "@/features/contact";
import { SectionHeader } from "@/shared/components/misc/section-header";

export const Route = createFileRoute("/admin/corporate-inquiries/")({ component: CorporateInquiriesPage });

function CorporateInquiriesPage() {
  const { data, isLoading, error } = useAdminCorporateInquiries();
  const resolve = useAdminResolveCorporateInquiry();
  return <div className="space-y-6"><SectionHeader eyebrow="Sales" title="Corporate Inquiries" description="Consultation requests submitted from the corporate wellness page." /><CorporateInquiriesTable inquiries={data?.data ?? []} isLoading={isLoading} error={error} onResolve={(inquiry: AdminCorporateInquiry) => resolve.mutate(inquiry.id)} isResolving={resolve.isPending} /></div>;
}

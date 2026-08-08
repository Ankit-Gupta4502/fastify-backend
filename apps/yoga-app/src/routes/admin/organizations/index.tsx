import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import type { AdminOrganizationSummary } from "@/api/admin";
import { useAdminOrganizations } from "@/features/admin/hooks/use-admin";
import { OrganizationsTable } from "@/features/admin/components/organizations-table";
import { OrganizationPricingDialog } from "@/features/admin/components/organization-pricing-dialog";
import { OrganizationCouponDialog } from "@/features/admin/components/organization-coupon-dialog";
import { SectionHeader } from "@/shared/components/misc/section-header";

export const Route = createFileRoute("/admin/organizations/")({
  component: AdminOrganizationsPage,
});

function AdminOrganizationsPage() {
  const { data, isLoading, error } = useAdminOrganizations();
  const [pricingOrg, setPricingOrg] = useState<AdminOrganizationSummary | null>(null);
  const [couponOrg, setCouponOrg] = useState<AdminOrganizationSummary | null>(null);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Admin"
        title="Organizations"
        description="Corporate signups — approve billing and set per-seat pricing once sales has negotiated terms."
      />

      <OrganizationsTable
        organizations={data?.data ?? []}
        isLoading={isLoading}
        error={error}
        onSetPricing={setPricingOrg}
        onSetCoupon={setCouponOrg}
      />

      <OrganizationPricingDialog organization={pricingOrg} onOpenChange={(open) => !open && setPricingOrg(null)} />
      <OrganizationCouponDialog organization={couponOrg} onOpenChange={(open) => !open && setCouponOrg(null)} />
    </div>
  );
}

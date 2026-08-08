import { createFileRoute } from "@tanstack/react-router";
import { BillingPendingApproval } from "@/features/organization/components/billing-pending-approval";
import { CorporateCouponCard } from "@/features/organization/components/corporate-coupon-card";
import { SeatPurchaseCard } from "@/features/organization/components/seat-purchase-card";

export const Route = createFileRoute("/org/billing/")({
  component: BillingPage,
});

function BillingPage() {
  const { organizationId, billingApproved } = Route.useRouteContext();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Buy sponsored seats for your team, and share the self-pay discount code.
        </p>
      </div>

      {billingApproved ? (
        <div className="grid gap-6 md:grid-cols-2">
          <SeatPurchaseCard organizationId={organizationId} />
          <CorporateCouponCard organizationId={organizationId} />
        </div>
      ) : (
        <BillingPendingApproval />
      )}
    </div>
  );
}

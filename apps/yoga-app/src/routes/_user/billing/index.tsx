import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, CreditCard } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useMyPlan } from "@/features/payments/hooks/use-plans";
import { getPlanLabel } from "@/features/payments/utils/plan-copy";
import { CancelSubscriptionButton } from "@/features/payments/components/billing";
import { SectionHeader } from "@/shared/components/misc/section-header";
import { EmptyState } from "@/shared/components/misc/empty-state";
import { Chip } from "@/shared/components/misc/chip";
import { TableCell } from "@/components/ui/table";
import { DataTable, type DataTableColumn } from "@/shared/components/tables";
import { paidAmountToDisplay } from "@/shared/lib/utils";

export const Route = createFileRoute("/_user/billing/")({
  component: BillingPage,
});

const COLUMNS: DataTableColumn[] = [
  { key: "plan", header: "Plan" },
  { key: "sessions", header: "Sessions" },
  { key: "billing", header: "Billing" },
  { key: "price", header: "Price paid" },
  { key: "purchased", header: "Purchased" },
  { key: "expires", header: "Expires" },
  { key: "status", header: "Status" },
  { key: "actions", header: "" },
];

function BillingPage() {
  const { isAuthenticated } = useAuth();
  const myPlan = useMyPlan(isAuthenticated);
  const subscriptions = myPlan.data?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-16 space-y-8">
      <SectionHeader
        eyebrow="Billing"
        title="Your plans"
        description="Manage your active subscriptions and billing."
      />

      <DataTable
        columns={COLUMNS}
        data={subscriptions}
        isLoading={myPlan.isLoading}
        loadingRows={2}
        error={myPlan.error}
        errorMessage="Failed to load your plans. Please refresh."
        emptyMessage={
          <EmptyState
            icon={CreditCard}
            title="No active plans"
            description="Subscribe to a plan to start booking sessions."
            action={{ label: "View plans", to: "/pricing" }}
          />
        }
        getRowKey={(sub) => sub.subscriptionId}
        renderCells={(sub) => (
          <>
            <TableCell className="font-medium">{getPlanLabel(sub.plan.name)}</TableCell>
            <TableCell className="text-muted-foreground">
              {sub.sessionsTotal === null ? "Unlimited" : `${sub.sessionsUsed} / ${sub.sessionsTotal}`}
            </TableCell>
            <TableCell className="text-muted-foreground capitalize">{sub.plan.billingInterval}</TableCell>
            <TableCell className="font-medium">{paidAmountToDisplay(sub.pricePaidCents, sub.currency)}</TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(sub.purchasedAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "—"}
            </TableCell>
            <TableCell>
              <Chip variant="success" icon={CheckCircle2}>
                Active
              </Chip>
            </TableCell>
            <TableCell>
              <CancelSubscriptionButton
                subscriptionId={sub.subscriptionId}
                planName={sub.plan.name}
                expiresAt={sub.expiresAt}
              />
            </TableCell>
          </>
        )}
      />
    </div>
  );
}

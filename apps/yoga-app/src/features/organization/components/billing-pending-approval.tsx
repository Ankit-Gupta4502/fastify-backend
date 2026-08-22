import { Clock } from "lucide-react";

export function BillingPendingApproval() {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 py-16 text-center">
      <Clock className="mx-auto size-8 text-muted-foreground/50 mb-3" />
      <p className="font-medium">Billing is pending approval</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        Our team is finalizing pricing for your organization. You'll be able to buy seats and share
        your discount code here once that's approved.
      </p>
    </div>
  );
}

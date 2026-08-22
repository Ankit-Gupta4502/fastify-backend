import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { AdminCorporatePlan, AdminPlan } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { useAdminCorporatePlans, useAdminPlans } from "@/features/admin/hooks/use-admin";
import { PlansTable } from "@/features/admin/components/plans-table";
import { PlanFormDialog } from "@/features/admin/components/plan-form-dialog";
import { CorporatePlansTable } from "@/features/admin/components/corporate-plans-table";
import { CorporatePlanFormDialog } from "@/features/admin/components/corporate-plan-form-dialog";
import { SectionHeader } from "@/shared/components/misc/section-header";

export const Route = createFileRoute("/admin/plans/")({
  component: AdminPlansPage,
});

function AdminPlansPage() {
  const [planFormOpen, setPlanFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [corporateFormOpen, setCorporateFormOpen] = useState(false);
  const [editingCorporatePlan, setEditingCorporatePlan] = useState<AdminCorporatePlan | null>(null);

  const { data: plansData, isLoading: plansLoading, error: plansError } = useAdminPlans();
  const {
    data: corporatePlansData,
    isLoading: corporatePlansLoading,
    error: corporatePlansError,
  } = useAdminCorporatePlans();

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <SectionHeader eyebrow="Admin" title="Plans" description="Individual retail plans users subscribe to." />
          <Button
            className="rounded-2xl gap-2 shadow-sm"
            onClick={() => {
              setEditingPlan(null);
              setPlanFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            New plan
          </Button>
        </div>

        <PlansTable
          plans={plansData?.data ?? []}
          isLoading={plansLoading}
          error={plansError}
          onEdit={(plan) => {
            setEditingPlan(plan);
            setPlanFormOpen(true);
          }}
        />

        <PlanFormDialog
          open={planFormOpen}
          onOpenChange={(open) => {
            setPlanFormOpen(open);
            if (!open) setEditingPlan(null);
          }}
          plan={editingPlan}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <SectionHeader
            eyebrow="Admin"
            title="Corporate plans"
            description="What orgs pick from when buying seats — each links to one of the plans above for session limits/capacity."
          />
          <Button
            className="rounded-2xl gap-2 shadow-sm"
            onClick={() => {
              setEditingCorporatePlan(null);
              setCorporateFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            New corporate plan
          </Button>
        </div>

        <CorporatePlansTable
          corporatePlans={corporatePlansData?.data ?? []}
          isLoading={corporatePlansLoading}
          error={corporatePlansError}
          onEdit={(corporatePlan) => {
            setEditingCorporatePlan(corporatePlan);
            setCorporateFormOpen(true);
          }}
        />

        <CorporatePlanFormDialog
          open={corporateFormOpen}
          onOpenChange={(open) => {
            setCorporateFormOpen(open);
            if (!open) setEditingCorporatePlan(null);
          }}
          corporatePlan={editingCorporatePlan}
        />
      </div>
    </div>
  );
}

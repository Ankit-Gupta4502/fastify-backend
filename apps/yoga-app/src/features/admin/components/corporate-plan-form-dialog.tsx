import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AdminCorporatePlan, CreateCorporatePlanBody } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminPlans,
  useCreateCorporatePlan,
  useUpdateCorporatePlan,
} from "@/features/admin/hooks/use-admin";

interface CorporatePlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  corporatePlan: AdminCorporatePlan | null;
}

function toFormState(corporatePlan: AdminCorporatePlan | null): CreateCorporatePlanBody {
  return {
    name: corporatePlan?.name ?? "",
    linkedPlanId: corporatePlan?.linkedPlanId ?? "",
    billingInterval: (corporatePlan?.billingInterval as "week" | "month") ?? "month",
    basePricePerSeatCents: corporatePlan?.basePricePerSeatCents ?? null,
    basePricePerSeatInrPaise: corporatePlan?.basePricePerSeatInrPaise ?? null,
  };
}

function toNullableInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function CorporatePlanFormDialog({ open, onOpenChange, corporatePlan }: CorporatePlanFormDialogProps) {
  const isEditing = corporatePlan !== null;
  const [form, setForm] = useState<CreateCorporatePlanBody>(() => toFormState(corporatePlan));
  const [error, setError] = useState<string | null>(null);
  const { data: plansResponse, isLoading: plansLoading } = useAdminPlans();
  const createCorporatePlan = useCreateCorporatePlan();
  const updateCorporatePlan = useUpdateCorporatePlan();
  const isPending = createCorporatePlan.isPending || updateCorporatePlan.isPending;
  const plans = plansResponse?.data ?? [];

  useEffect(() => {
    if (open) {
      setForm(toFormState(corporatePlan));
      setError(null);
    }
  }, [open, corporatePlan]);

  function handleSubmit() {
    setError(null);
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.linkedPlanId) {
      setError("Pick a plan to link to");
      return;
    }

    const onSuccess = () => onOpenChange(false);
    const onError = (err: unknown) =>
      setError(err instanceof Error ? err.message : "Failed to save corporate plan");

    if (isEditing) {
      updateCorporatePlan.mutate({ id: corporatePlan.id, body: form }, { onSuccess, onError });
    } else {
      createCorporatePlan.mutate(form, { onSuccess, onError });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit corporate plan" : "New corporate plan"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Corporate Group Plan"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Linked plan</Label>
            <Select
              value={form.linkedPlanId || undefined}
              onValueChange={(v) => setForm((f) => ({ ...f, linkedPlanId: v }))}
              disabled={plansLoading}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder={plansLoading ? "Loading plans…" : "Select a plan"} />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Sponsored seats get session limits/capacity from this plan — the corporate plan only adds bulk pricing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Billing interval</Label>
              <Select
                value={form.billingInterval}
                onValueChange={(v) => setForm((f) => ({ ...f, billingInterval: v as "week" | "month" }))}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div />

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Per-seat price (USD cents)</Label>
              <Input
                type="number"
                value={form.basePricePerSeatCents ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, basePricePerSeatCents: toNullableInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Per-seat price (INR paise)</Label>
              <Input
                type="number"
                value={form.basePricePerSeatInrPaise ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, basePricePerSeatInrPaise: toNullableInt(e.target.value) }))}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : isEditing ? (
              "Save changes"
            ) : (
              "Create corporate plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

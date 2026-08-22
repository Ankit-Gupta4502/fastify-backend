import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AdminPlan, CreatePlanBody } from "@/api/admin";
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
import { useCreatePlan, useUpdatePlan } from "@/features/admin/hooks/use-admin";

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: AdminPlan | null;
}

function toFormState(plan: AdminPlan | null): CreatePlanBody {
  return {
    name: plan?.name ?? "",
    category: plan?.category ?? "standard",
    billingInterval: (plan?.billingInterval as "week" | "month") ?? "month",
    sessionsPerWeek: plan?.sessionsPerWeek ?? null,
    sessionsPerMonth: plan?.sessionsPerMonth ?? null,
    allowsPrivate: plan?.allowsPrivate ?? false,
    allowsTimeFlexibility: plan?.allowsTimeFlexibility ?? false,
    maxRoomCapacity: plan?.maxRoomCapacity ?? null,
    priceCents: plan?.priceCents ?? null,
    priceInrPaise: plan?.priceInrPaise ?? null,
    pricePerSessionCents: plan?.pricePerSessionCents ?? null,
    pricePerSessionInrPaise: plan?.pricePerSessionInrPaise ?? null,
  };
}

function toNullableInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function PlanFormDialog({ open, onOpenChange, plan }: PlanFormDialogProps) {
  const isEditing = plan !== null;
  const [form, setForm] = useState<CreatePlanBody>(() => toFormState(plan));
  const [error, setError] = useState<string | null>(null);
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const isPending = createPlan.isPending || updatePlan.isPending;

  useEffect(() => {
    if (open) {
      setForm(toFormState(plan));
      setError(null);
    }
  }, [open, plan]);

  function handleSubmit() {
    setError(null);
    if (!form.name.trim()) {
      setError("Plan name is required");
      return;
    }

    const onSuccess = () => onOpenChange(false);
    const onError = (err: unknown) =>
      setError(err instanceof Error ? err.message : "Failed to save plan");

    if (isEditing) {
      updatePlan.mutate({ id: plan.id, body: form }, { onSuccess, onError });
    } else {
      createPlan.mutate(form, { onSuccess, onError });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit plan" : "New plan"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label className="text-xs font-medium">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="group_live"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Category</Label>
              <Input
                value={form.category ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>

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

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sessions / week</Label>
              <Input
                type="number"
                value={form.sessionsPerWeek ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, sessionsPerWeek: toNullableInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sessions / month</Label>
              <Input
                type="number"
                value={form.sessionsPerMonth ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, sessionsPerMonth: toNullableInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Max room capacity</Label>
              <Input
                type="number"
                value={form.maxRoomCapacity ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, maxRoomCapacity: toNullableInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Price (USD cents)</Label>
              <Input
                type="number"
                value={form.priceCents ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, priceCents: toNullableInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Price (INR paise)</Label>
              <Input
                type="number"
                value={form.priceInrPaise ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, priceInrPaise: toNullableInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Per-session (USD cents)</Label>
              <Input
                type="number"
                value={form.pricePerSessionCents ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, pricePerSessionCents: toNullableInt(e.target.value) }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Per-session (INR paise)</Label>
              <Input
                type="number"
                value={form.pricePerSessionInrPaise ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, pricePerSessionInrPaise: toNullableInt(e.target.value) }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowsPrivate"
                className="size-3.5 rounded border-muted bg-background text-primary focus:ring-primary/20"
                checked={form.allowsPrivate ?? false}
                onChange={(e) => setForm((f) => ({ ...f, allowsPrivate: e.target.checked }))}
              />
              <Label htmlFor="allowsPrivate" className="text-xs font-normal cursor-pointer">
                Allows private sessions
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowsTimeFlexibility"
                className="size-3.5 rounded border-muted bg-background text-primary focus:ring-primary/20"
                checked={form.allowsTimeFlexibility ?? false}
                onChange={(e) => setForm((f) => ({ ...f, allowsTimeFlexibility: e.target.checked }))}
              />
              <Label htmlFor="allowsTimeFlexibility" className="text-xs font-normal cursor-pointer">
                Flexible timing
              </Label>
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
              "Create plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { AdminOrganizationSummary } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSetOrganizationPricing } from "@/features/admin/hooks/use-admin";

interface OrganizationPricingDialogProps {
  organization: AdminOrganizationSummary | null;
  onOpenChange: (open: boolean) => void;
}

function toNullableInt(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function OrganizationPricingDialog({ organization, onOpenChange }: OrganizationPricingDialogProps) {
  const [pricePerSeatCents, setPricePerSeatCents] = useState("");
  const [pricePerSeatInrPaise, setPricePerSeatInrPaise] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setPricing = useSetOrganizationPricing();

  useEffect(() => {
    if (organization) {
      setPricePerSeatCents(organization.pricePerSeatCents != null ? String(organization.pricePerSeatCents) : "");
      setPricePerSeatInrPaise(
        organization.pricePerSeatInrPaise != null ? String(organization.pricePerSeatInrPaise) : "",
      );
      setError(null);
    }
  }, [organization]);

  function handleSubmit() {
    if (!organization) return;
    setError(null);
    setPricing.mutate(
      {
        id: organization.id,
        body: {
          pricePerSeatCents: toNullableInt(pricePerSeatCents),
          pricePerSeatInrPaise: toNullableInt(pricePerSeatInrPaise),
        },
      },
      {
        onSuccess: () => onOpenChange(false),
        onError: (err) => setError(err instanceof Error ? err.message : "Failed to save pricing"),
      },
    );
  }

  return (
    <Dialog open={organization !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Set per-seat price</DialogTitle>
          <DialogDescription>
            {organization?.name} — whatever sales negotiated for this org's seats.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Per seat (USD cents)</Label>
            <Input
              type="number"
              value={pricePerSeatCents}
              onChange={(e) => setPricePerSeatCents(e.target.value)}
              placeholder="e.g. 2900"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Per seat (INR paise)</Label>
            <Input
              type="number"
              value={pricePerSeatInrPaise}
              onChange={(e) => setPricePerSeatInrPaise(e.target.value)}
              placeholder="e.g. 99900"
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={setPricing.isPending} className="w-full">
            {setPricing.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save pricing"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

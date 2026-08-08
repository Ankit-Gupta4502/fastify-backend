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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSetOrganizationCoupon } from "@/features/admin/hooks/use-admin";

interface OrganizationCouponDialogProps {
  organization: AdminOrganizationSummary | null;
  onOpenChange: (open: boolean) => void;
}

export function OrganizationCouponDialog({ organization, onOpenChange }: OrganizationCouponDialogProps) {
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const setCoupon = useSetOrganizationCoupon();

  useEffect(() => {
    if (organization) {
      setType("percent");
      setValue("");
      setError(null);
      setResult(null);
    }
  }, [organization]);

  function handleSubmit() {
    if (!organization) return;
    setError(null);
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
      setError("Enter a valid discount value");
      return;
    }
    if (type === "percent" && parsed > 100) {
      setError("Percent discount can't exceed 100");
      return;
    }

    setCoupon.mutate(
      { id: organization.id, body: { type, value: Math.round(parsed) } },
      {
        onSuccess: (response) => setResult(response.data?.code ?? null),
        onError: (err) => setError(err instanceof Error ? err.message : "Failed to save coupon"),
      },
    );
  }

  return (
    <Dialog open={organization !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>Set self-pay coupon</DialogTitle>
          <DialogDescription>
            {organization?.name} — the discount members get when they self-pay instead of using a sponsored seat.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "percent" | "flat")}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent off</SelectItem>
                <SelectItem value="flat">Flat amount off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              {type === "percent" ? "Percent (0–100)" : "Amount (smallest currency unit)"}
            </Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "e.g. 15" : "e.g. 500"}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {result && <p className="text-sm text-emerald-600">Coupon code: {result}</p>}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={setCoupon.isPending} className="w-full">
            {setCoupon.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              "Save coupon"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

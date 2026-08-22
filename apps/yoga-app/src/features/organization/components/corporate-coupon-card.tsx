import { useState } from "react";
import { Check, Copy, Ticket } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationCoupon } from "@/features/organization/hooks/use-organization-coupon";

interface CorporateCouponCardProps {
  organizationId: string;
}

export function CorporateCouponCard({ organizationId }: CorporateCouponCardProps) {
  const { data, isLoading } = useOrganizationCoupon(organizationId);
  const [copied, setCopied] = useState(false);

  const coupon = data?.data;

  async function handleCopy() {
    if (!coupon) return;
    await navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Ticket className="size-4 text-primary" />
          Self-pay discount code
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-40 rounded-xl" />
        ) : coupon ? (
          <div className="flex items-center gap-3">
            <code className="rounded-xl bg-muted/50 px-4 py-2 text-lg font-mono font-semibold tracking-wide">
              {coupon.code}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {coupon.type === "percent" ? `${coupon.value}% off` : `Flat discount`}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No coupon found for this organization.</p>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Share this code with members who aren't on a sponsored seat — they can apply it at checkout for a discount.
        </p>
      </CardContent>
    </Card>
  );
}

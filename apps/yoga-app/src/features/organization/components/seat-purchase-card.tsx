import { useState } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCorporatePlans } from "@/features/organization/hooks/use-corporate-plans";
import { useSeatPurchase } from "@/features/organization/hooks/use-seat-purchase";

interface SeatPurchaseCardProps {
  organizationId: string;
}

export function SeatPurchaseCard({ organizationId }: SeatPurchaseCardProps) {
  const { data: plansResponse, isLoading: plansLoading } = useCorporatePlans();
  const purchase = useSeatPurchase(organizationId);

  const plans = plansResponse?.data ?? [];
  const [corporatePlanId, setCorporatePlanId] = useState("");
  const [seats, setSeats] = useState("10");
  const [feedback, setFeedback] = useState<string | null>(null);

  function handlePurchase() {
    setFeedback(null);
    const seatCount = Number(seats);
    if (!corporatePlanId) {
      setFeedback("Select a plan first");
      return;
    }
    if (!Number.isInteger(seatCount) || seatCount < 1) {
      setFeedback("Enter a valid number of seats");
      return;
    }
    purchase.mutate(
      { corporatePlanId, seats: seatCount },
      {
        onSuccess: () => setFeedback("success:Seats purchased — members will be sponsored automatically as they join."),
        onError: (err) => setFeedback(err instanceof Error ? err.message : "Purchase failed"),
      },
    );
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart className="size-4 text-primary" />
          Buy seats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {plansLoading ? (
          <Skeleton className="h-10 w-full rounded-xl" />
        ) : (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Plan</Label>
            <Select value={corporatePlanId} onValueChange={setCorporatePlanId}>
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select a corporate plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Number of seats</Label>
          <Input
            type="number"
            min={1}
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            Bigger blocks unlock a bigger per-seat discount automatically.
          </p>
        </div>

        {feedback && (
          <p className={feedback.startsWith("success:") ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
            {feedback.startsWith("success:") ? feedback.slice(8) : feedback}
          </p>
        )}

        <Button onClick={handlePurchase} disabled={purchase.isPending} className="w-full">
          {purchase.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Processing…
            </>
          ) : (
            "Buy seats"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

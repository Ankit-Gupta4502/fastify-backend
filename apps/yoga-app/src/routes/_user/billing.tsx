import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Shield, Sparkles, Wallet } from "lucide-react";
import type { PlanRecord } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMyPlan, usePlansWithPricing } from "@/hooks/use-plans";
import { useCheckout } from "@/hooks/use-checkout";

export const Route = createFileRoute("/_user/billing")({
  component: BillingPage,
});

const PLAN_COPY: Record<string, { title: string; tagline: string; perks: string[] }> = {
  group_live: {
    title: "Group Live",
    tagline: "Live group flows with elite instructors.",
    perks: [
      "3 live group sessions / week",
      "Access to all group rooms",
      "Local-time auto conversion",
      "Cancel any time",
    ],
  },
  private: {
    title: "Private",
    tagline: "1:1 sessions with your chosen instructor.",
    perks: [
      "Unlimited private bookings",
      "Time-of-day flexibility",
      "Direct instructor messaging",
      "Priority support",
    ],
  },
  on_demand: {
    title: "On Demand",
    tagline: "Pre-recorded library for any moment.",
    perks: [
      "Full on-demand library",
      "Practice on your schedule",
      "Beginner to advanced paths",
      "No live commitments",
    ],
  },
};

function dollars(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function BillingPage() {
  const plans = usePlansWithPricing();
  const myPlan = useMyPlan();
  const checkout = useCheckout();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const planList: PlanRecord[] = plans.data?.data ?? [];
  const activePlanId = myPlan.data?.data?.plan?.id ?? null;

  const handleSubscribe = (plan: PlanRecord) => {
    setError(null);
    setSuccess(null);
    checkout.mutate(plan.id, {
      onSuccess: () => setSuccess(`Welcome to ${plan.name.replace("_", " ")}!`),
      onError: (err) =>
        setError(err instanceof Error ? err.message : "Payment failed"),
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      {/* Header */}
      <div className="space-y-3 max-w-2xl">
        <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md inline-block">
          Billing
        </span>
        <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">
          Pick the rhythm that <span className="italic text-primary">moves you</span>
        </h1>
        <p className="text-muted-foreground">
          Subscribe securely via Razorpay. Change plans whenever — no penalties.
        </p>
      </div>

      {/* Current plan banner */}
      <Card className="border-none bg-secondary/30 rounded-3xl">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="size-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                Current plan
              </p>
              {myPlan.isLoading ? (
                <Skeleton className="h-6 w-32 mt-1" />
              ) : (
                <p className="text-lg font-bold capitalize">
                  {myPlan.data?.data?.plan?.name?.replace("_", " ") || "None"}
                </p>
              )}
            </div>
          </div>
          {myPlan.data?.data?.plan && (
            <Badge className="bg-accent/15 text-accent border-none px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
              Active
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Feedback */}
      {(error || success) && (
        <div
          className={cn(
            "rounded-2xl p-4 text-sm",
            error
              ? "bg-destructive/5 border border-destructive/40 text-destructive"
              : "bg-emerald-500/5 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
          )}
        >
          {error ?? success}
        </div>
      )}

      {/* Plans grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-112 rounded-4xl" />
            ))
          : planList.map((plan) => {
              const copy = PLAN_COPY[plan.name] ?? {
                title: plan.name,
                tagline: "",
                perks: [],
              };
              const isPopular = plan.name === "private";
              const isActive = activePlanId === plan.id;

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative border-none shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full rounded-4xl",
                    isPopular
                      ? "bg-card scale-105 z-10 ring-2 ring-primary/30"
                      : "bg-card/50 backdrop-blur-sm",
                  )}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute -top-4 right-6 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      Current
                    </div>
                  )}

                  <CardHeader className="pt-10 pb-6 text-center">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                      {copy.title}
                    </CardTitle>
                    <CardDescription className="pt-2">{copy.tagline}</CardDescription>
                    <div className="pt-6 flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-serif font-bold">
                        {dollars(plan.priceCents)}
                      </span>
                      <span className="text-muted-foreground font-medium">/mo</span>
                    </div>
                  </CardHeader>

                  <CardContent className="grow space-y-4 px-8">
                    {copy.perks.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="size-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </div>
                    ))}
                  </CardContent>

                  <CardFooter className="pb-10 px-8">
                    <Button
                      className={cn(
                        "w-full rounded-2xl py-6 font-bold shadow-lg transition-all",
                        isPopular
                          ? "bg-primary shadow-primary/20 hover:shadow-primary/30"
                          : "",
                      )}
                      variant={isPopular ? "default" : "outline"}
                      disabled={isActive || checkout.isPending}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {isActive
                        ? "Current plan"
                        : checkout.isPending
                          ? "Opening checkout..."
                          : `Subscribe to ${copy.title}`}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
      </div>

      {/* Secure footer */}
      <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-secondary/30 border border-border/50 p-8 md:p-12 text-center space-y-4 relative overflow-hidden">
        <div className="relative z-10">
          <Shield className="size-10 text-primary mx-auto mb-3" />
          <h3 className="text-2xl font-bold">Razorpay-secured payments</h3>
          <p className="text-muted-foreground max-w-md mx-auto text-sm">
            All transactions are encrypted end-to-end. Cards never touch our servers — we
            verify the signed payment receipt instead.
          </p>
          <div className="flex items-center justify-center gap-2 pt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            PCI-DSS compliant
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 size-64 bg-primary/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
}

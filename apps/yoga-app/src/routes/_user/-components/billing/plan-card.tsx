import { useState } from "react";
import { PLAN_COPY } from '@/lib/plan-copy';
import { AlertTriangle, Check, Loader2, XCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn, centsToDisplay } from "@/lib/utils";
import { useCancelSubscription } from "@/hooks/use-checkout";



interface PlanCardProps {
  plan: PlanRecord;
  isActive: boolean;
  isPending?: boolean;
  onSubscribe?: (plan: PlanRecord) => void;
  readOnly?: boolean;
  expiresAt?: string | null;
}

export function PlanCard({ plan, isActive, isPending, onSubscribe, readOnly, expiresAt }: PlanCardProps) {
  const copy = PLAN_COPY[plan.name] ?? { title: plan.name, tagline: "", perks: [] };
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const cancel = useCancelSubscription();

  const displayName = plan.name.replace(/_/g, " ");
  const expiryDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  function handleConfirmCancel() {
    setCancelError(null);
    cancel.mutate(undefined, {
      onSuccess: () => setCancelOpen(false),
      onError: (err) => setCancelError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
    });
  }


  return (
    <Card
      className={cn(
        "relative border-none shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full rounded-4xl",
       
      )}
    >
      
      {isActive && (
        <div className="absolute -top-4 right-6 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
          Current
        </div>
      )}

      <CardHeader className="pt-10 pb-6 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">{copy.title}</CardTitle>
        <CardDescription className="pt-2">{copy.tagline}</CardDescription>
        <div className="pt-6 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-serif font-bold">{centsToDisplay(plan.priceCents)}</span>
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

      {!readOnly && (
        <CardFooter className="pb-10 px-8">
          <Button
            className={cn(
              "w-full rounded-2xl py-6 font-bold shadow-lg transition-all",

            )}
            variant={ "outline"}
            disabled={isActive || isPending}
            onClick={() => onSubscribe?.(plan)}
          >
            {isActive
              ? "Current plan"
              : isPending
                ? "Opening checkout..."
                : `Subscribe to ${copy.title}`}
          </Button>
        </CardFooter>
      )}

      {isActive && readOnly && expiresAt !== undefined && (
        <CardFooter className="pb-8 px-8 pt-0 flex-col items-stretch gap-3">
          <div className="border-t border-border/50" />
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <XCircle className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Cancel subscription</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {expiryDate
                  ? <>Access continues until <span className="font-medium text-foreground">{expiryDate}</span>.</>
                  : "Access continues until end of billing period."}
              </p>
            </div>
          </div>
          <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
              >
                Cancel subscription
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-3xl">
              <DialogHeader>
                <div className="mx-auto mb-2 size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                  <AlertTriangle className="size-6" />
                </div>
                <DialogTitle className="text-center">Cancel your subscription?</DialogTitle>
                <DialogDescription className="text-center">
                  Your <span className="font-medium capitalize text-foreground">{displayName}</span> plan will remain active
                  {expiryDate ? (
                    <> until <span className="font-medium text-foreground">{expiryDate}</span>. After that, you'll lose access to your sessions.</>
                  ) : (
                    " until the end of the current billing period."
                  )}
                </DialogDescription>
              </DialogHeader>
              {cancelError && (
                <p className="text-sm text-destructive text-center px-2">{cancelError}</p>
              )}
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCancelOpen(false)} disabled={cancel.isPending}>
                  Keep subscription
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleConfirmCancel} disabled={cancel.isPending}>
                  {cancel.isPending ? <><Loader2 className="size-4 animate-spin" /> Cancelling…</> : "Yes, cancel"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
}

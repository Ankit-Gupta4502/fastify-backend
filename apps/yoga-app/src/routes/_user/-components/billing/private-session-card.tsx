import { useState } from "react";
import { AlertTriangle, Check, Loader2, Minus, Plus, XCircle } from "lucide-react";
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
import { cn } from "@/lib/utils";
import {
  PRICE_DISCOUNT_CENTS,
  PRICE_DISCOUNT_INR_PAISE,
  MIN_SESSIONS,
} from "@yoga-app/shared";
import { useCancelSubscription } from "@/hooks/use-checkout";
import { usePlanPrice } from "@/hooks/use-plan-price";
import { PLAN_COPY } from "@/lib/plan-copy";

interface PrivateSessionCardProps {
  planName?: string;
  sessionCount: number;
  onSessionCountChange: (n: number) => void;
  isActive: boolean;
  activeSessions: number | null;
  isPending: boolean;
  onSubscribe: (sessionCount: number) => void;
  readOnly?: boolean;
  expiresAt?: string | null;
  subscriptionId?: string | null;
  isIndia?: boolean;
  pricePerSessionCents?: number | null;
  pricePerSessionInrPaise?: number | null;
}

export function PrivateSessionCard({
  planName = "private",
  sessionCount,
  onSessionCountChange,
  isActive,
  activeSessions,
  isPending,
  onSubscribe,
  readOnly,
  expiresAt,
  subscriptionId,
  isIndia,
  pricePerSessionCents,
  pricePerSessionInrPaise,
}: PrivateSessionCardProps) {
  const copy = PLAN_COPY[planName] ?? { title: "Private 1:1", tagline: "Personalised sessions with your chosen instructor.", perks: [] };
  const sessions = readOnly && activeSessions ? activeSessions : sessionCount;
  // "private" sessions get a small volume discount; the other session-based
  // plans (prenatal/therapeutic) are billed at a flat per-session rate.
  const discountCents = planName === "private" ? PRICE_DISCOUNT_CENTS : 0;
  const discountInrPaise = planName === "private" ? PRICE_DISCOUNT_INR_PAISE : 0;

  const { display: priceDisplay } = usePlanPrice({
    isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise,
    quantity: sessions, discountCents, discountInrPaise,
  });
  const { display: basePriceDisplay } = usePlanPrice({
    isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise,
    quantity: MIN_SESSIONS, discountCents, discountInrPaise,
  });
  const { display: rateDisplay } = usePlanPrice({ isIndia, priceCents: pricePerSessionCents, priceInrPaise: pricePerSessionInrPaise });
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const cancel = useCancelSubscription();

  const expiryDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  function handleConfirmCancel() {
    if (!subscriptionId) return;
    setCancelError(null);
    cancel.mutate(subscriptionId, {
      onSuccess: () => setCancelOpen(false),
      onError: (err) => setCancelError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
    });
  }

  return (
    <Card
      className={cn(
        "relative border-none shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full rounded-4xl",
        "bg-card scale-105 z-10 ring-2 ring-primary/30",
      )}
    >

      {isActive && (
        <div className="absolute -top-4 right-6 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
          Current
        </div>
      )}

      <CardHeader className="pt-10 pb-4 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">{copy.title}</CardTitle>
        <CardDescription className="pt-2">{copy.tagline}</CardDescription>

        {/* Session stepper — hidden in read-only mode */}
        {!readOnly && (
          <div className="pt-5 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
              disabled={sessionCount <= MIN_SESSIONS || isPending}
              onClick={() => onSessionCountChange(sessionCount - 1)}
            >
              <Minus className="size-3" />
            </Button>
            <span className="text-lg font-semibold w-28 text-center">
              {sessionCount} sessions/mo
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
              disabled={isPending}
              onClick={() => onSessionCountChange(sessionCount + 1)}
            >
              <Plus className="size-3" />
            </Button>
          </div>
        )}

        <div className="pt-4 flex items-baseline justify-center gap-1">
          <span className="text-5xl font-serif font-bold">{priceDisplay}</span>
          <span className="text-muted-foreground font-medium">/mo</span>
        </div>
        {!readOnly && sessionCount > MIN_SESSIONS && (
          <p className="text-xs text-muted-foreground pt-1">
            {basePriceDisplay}/mo base · +{rateDisplay} per extra session
          </p>
        )}
        {readOnly && activeSessions !== null && (
          <p className="text-sm font-semibold pt-1">{activeSessions} sessions/mo</p>
        )}
      </CardHeader>

      <CardContent className="grow space-y-4 px-8">
        {copy.perks.map((perk) => (
          <div key={perk} className="flex items-start gap-3">
            <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-3 text-primary" />
            </div>
            <span className="text-sm text-foreground/80">{perk}</span>
          </div>
        ))}
        {!readOnly && activeSessions !== null && (
          <p className="text-xs text-muted-foreground pt-2">
            Active plan: {activeSessions} sessions/mo
          </p>
        )}
      </CardContent>

      {!readOnly && (
        <CardFooter className="pb-10 px-8">
          <Button
            className="w-full rounded-2xl py-6 font-bold shadow-lg transition-all bg-primary shadow-primary/20 hover:shadow-primary/30"
            disabled={isPending || (isActive && activeSessions === sessionCount)}
            onClick={() => onSubscribe(sessionCount)}
          >
            {isPending ? "Opening checkout..." : isActive && activeSessions === sessionCount ? "Current plan" : "Subscribe"}
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
                  Your <span className="font-medium capitalize text-foreground">{copy.title}</span> plan will remain active
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

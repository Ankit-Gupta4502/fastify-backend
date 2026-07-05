import { useState } from "react";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCancelSubscription } from "@/features/payments/hooks/use-checkout";

interface CancelSubscriptionCardProps {
  subscriptionId: string;
  planName: string;
  expiresAt: string | null;
}

export function CancelSubscriptionCard({ subscriptionId, planName, expiresAt }: CancelSubscriptionCardProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancel = useCancelSubscription();

  const displayName = planName.replace(/_/g, " ");
  const expiryDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : null;

  function handleConfirm() {
    setError(null);
    cancel.mutate(subscriptionId, {
      onSuccess: () => setOpen(false),
      onError: (err) => setError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
    });
  }

  return (
    <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
          <XCircle className="size-5" />
        </div>
        <div>
          <p className="font-semibold text-sm">Cancel subscription</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            You're currently on the <span className="font-medium capitalize text-foreground">{displayName}</span> plan.
            {expiryDate && (
              <> Cancelling now will keep your access until <span className="font-medium text-foreground">{expiryDate}</span>.</>
            )}
          </p>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
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

          {error && (
            <p className="text-sm text-destructive text-center px-2">{error}</p>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={cancel.isPending}
            >
              Keep subscription
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirm}
              disabled={cancel.isPending}
            >
              {cancel.isPending ? (
                <><Loader2 className="size-4 animate-spin" /> Cancelling…</>
              ) : (
                "Yes, cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

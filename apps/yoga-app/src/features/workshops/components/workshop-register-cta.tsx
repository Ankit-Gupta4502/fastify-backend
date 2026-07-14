import { ArrowRight, CheckCircle2, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Workshop } from "@yoga-app/shared";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useWorkshopPricing } from "@/features/workshops/hooks/use-workshop-pricing";
import { useWorkshopRegistration } from "@/features/workshops/hooks/use-workshop-registration";

export function WorkshopRegisterCta({ workshop }: { workshop: Workshop }) {
  const { isAuthenticated } = useAuthStore();
  const { register, done, error, isPending } = useWorkshopRegistration(workshop);

  const spotsLeft = workshop.maxAttendees - workshop.attendeeCount;
  const full = spotsLeft <= 0;

  const { isPaid } = useWorkshopPricing(workshop);

  if (done) {
    return (
      <div className="flex items-center gap-2.5 text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl px-5 py-4">
        <CheckCircle2 className="size-5 shrink-0" />
        <div>
          <p className="font-semibold">You're registered!</p>
          <p className="text-xs font-normal text-emerald-600/80 mt-0.5">Check your email for details.</p>
        </div>
      </div>
    );
  }

  if (full) {
    return (
      <p className="text-sm text-center text-muted-foreground bg-secondary/40 rounded-2xl px-4 py-4">
        This workshop is full. Check back for future events.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {isPaid && !isAuthenticated && (
        <p className="text-xs text-center text-muted-foreground">
          Sign in to access the special offer price
        </p>
      )}
      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2">
          {error}
        </p>
      )}
      <Button
        size="lg"
        className="w-full rounded-xl gap-2 font-semibold"
        disabled={isPending}
        onClick={register}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> {isPaid ? "Processing payment…" : "Registering…"}
          </>
        ) : !isAuthenticated ? (
          <>
            <LogIn className="size-4" /> {isPaid ? "Sign in to Continue" : "Sign in to Register Free"}
          </>
        ) : isPaid ? (
          <>
            Pay & Reserve Spot <ArrowRight className="size-4" />
          </>
        ) : (
          <>
            Register Free <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}

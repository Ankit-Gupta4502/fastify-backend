import { Link } from "@tanstack/react-router";
import { Flame, VideoIcon } from "lucide-react";
import type { PlanRecord } from "@yoga-app/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PlanCardProps {
  plan: PlanRecord | null;
  sessionsUsed: number;
  sessionLimit: number | null;
  onBookPrivate?: () => void;
}

export function PlanCard({ plan, sessionsUsed, sessionLimit, onBookPrivate }: PlanCardProps) {
  const planLabel = plan ? plan.name.replace(/_/g, " ") : "Free trial";
  const canBookPrivate = plan?.allowsPrivate === true;

  return (
    <Card className="border-none shadow-lg bg-linear-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative rounded-3xl">
      <div className="absolute top-0 right-0 p-8 opacity-15 rotate-12 pointer-events-none">
        <Flame className="size-24" />
      </div>

      <CardContent className="p-8 relative z-10 space-y-4">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-80">Plan</p>

        <h3 className="text-2xl font-serif font-bold capitalize">{planLabel}</h3>

        <p className="text-primary-foreground/90 leading-relaxed text-sm">
          {plan
            ? sessionLimit === null
              ? "Unlimited sessions — flow whenever you want."
              : `${sessionsUsed} of ${sessionLimit} sessions used this week.`
            : "You're on a free trial — upgrade for full access."}
        </p>

        {canBookPrivate && (
          <Button
            onClick={onBookPrivate}
            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl font-bold py-5"
          >
            <VideoIcon className="size-4 mr-2" />
            Book Private 1:1
          </Button>
        )}

        <Button
          asChild
          className="w-full bg-white text-primary hover:bg-white/90 rounded-xl font-bold py-5"
        >
          <Link to={plan?"/billing":"/pricing"}>
            {plan ? "Manage plan" : "Choose a plan"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

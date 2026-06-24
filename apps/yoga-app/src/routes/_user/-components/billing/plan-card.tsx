import { PLAN_COPY } from '@/lib/plan-copy';
import { Check } from "lucide-react";
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
import { cn, centsToDisplay } from "@/lib/utils";



interface PlanCardProps {
  plan: PlanRecord;
  isActive: boolean;
  isPending?: boolean;
  onSubscribe?: (plan: PlanRecord) => void;
  readOnly?: boolean;
}

export function PlanCard({ plan, isActive, isPending, onSubscribe, readOnly }: PlanCardProps) {
  const copy = PLAN_COPY[plan.name] ?? { title: plan.name, tagline: "", perks: [] };


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
    </Card>
  );
}

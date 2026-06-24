import { Minus, Plus, Check } from "lucide-react";
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
import { PRICE_PER_SESSION_CENTS, MIN_SESSIONS, calcCustomPriceCents } from "@yoga-app/shared";

function calcPrice(sessions: number) {
  return calcCustomPriceCents(sessions);
}

const PERKS = [
  "Private 1:1 sessions with your instructor",
  "Time-of-day flexibility",
  "Direct instructor messaging",
  "Priority support",
];

interface PrivateSessionCardProps {
  sessionCount: number;
  onSessionCountChange: (n: number) => void;
  isActive: boolean;
  activeSessions: number | null;
  isPending: boolean;
  onSubscribe: (sessionCount: number) => void;
  readOnly?: boolean;
}

export function PrivateSessionCard({
  sessionCount,
  onSessionCountChange,
  isActive,
  activeSessions,
  isPending,
  onSubscribe,
  readOnly,
}: PrivateSessionCardProps) {
  const priceCents = calcPrice(readOnly && activeSessions ? activeSessions : sessionCount);

  return (
    <Card
      className={cn(
        "relative border-none shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full rounded-4xl",
        "bg-card scale-105 z-10 ring-2 ring-primary/30",
      )}
    >
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
        Most Popular
      </div>
      {isActive && (
        <div className="absolute -top-4 right-6 bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
          Current
        </div>
      )}

      <CardHeader className="pt-10 pb-4 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Private 1:1</CardTitle>
        <CardDescription className="pt-2">Personalised sessions with your chosen instructor.</CardDescription>

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
          <span className="text-5xl font-serif font-bold">{centsToDisplay(priceCents)}</span>
          <span className="text-muted-foreground font-medium">/mo</span>
        </div>
        {!readOnly && sessionCount > MIN_SESSIONS && (
          <p className="text-xs text-muted-foreground pt-1">
            {centsToDisplay(calcPrice(MIN_SESSIONS))}/mo base · +{centsToDisplay(PRICE_PER_SESSION_CENTS)} per extra session
          </p>
        )}
        {readOnly && activeSessions !== null && (
          <p className="text-sm font-semibold pt-1">{activeSessions} sessions/mo</p>
        )}
      </CardHeader>

      <CardContent className="grow space-y-4 px-8">
        {PERKS.map((perk) => (
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
    </Card>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowRight, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserPreferences } from "@yoga-app/shared";

interface Props {
  preferences: UserPreferences | null;
  isLoading: boolean;
}

export function ProfileCard({ preferences, isLoading }: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 px-5 py-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <UserCircle2 className="size-4 text-muted-foreground shrink-0" />
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Profile</p>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-full shrink-0 gap-1.5 font-semibold text-xs h-7 px-3">
          <Link to="/edit-profile">
            {preferences ? "Edit" : "Set up"} <ArrowRight className="size-3" />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ) : preferences ? (
        <div className="flex flex-wrap gap-2">
          {preferences.purposes.map((p: string) => (
            <span key={p} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {p}
            </span>
          ))}
          {preferences.preferredTimeOfDay && (
            <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              {preferences.preferredTimeOfDay} sessions
            </span>
          )}
          {preferences.gender && (
            <span className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-medium">
              {preferences.gender}
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Add your goals and schedule so we can recommend the right sessions for you.
        </p>
      )}
    </div>
  );
}

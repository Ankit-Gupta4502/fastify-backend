import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { useIntersection } from "@/shared/hooks/use-intersection";
import { usePublicRooms } from "@/features/booking/hooks/use-rooms";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { planQueryOptions } from "@/features/payments/hooks/use-plans";
import { SessionRow } from "@/features/marketing/components/session-row";

export function LiveScheduleSection() {
  const [sectionRef, isVisible] = useIntersection<HTMLElement>();
  const { data, isLoading } = usePublicRooms();
  const { isAuthenticated } = useAuthStore();
  const { data: planData } = useQuery({
    ...planQueryOptions.mine(),
    enabled: isAuthenticated,
  });

  const hasPlan = isAuthenticated && Boolean(planData?.data?.length);
  const scheduleLink = hasPlan ? "/rooms" : "/pricing";

  const sessions = data?.data ?? [];
  const hasLive = sessions.some((r) => r.canJoinLive);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "py-16 relative overflow-hidden transition-all duration-700 delay-100",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              {hasLive && (
                <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live now
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.4em] text-primary uppercase"><CalendarClock className="size-3" /> Upcoming classes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              What's on{" "}
              <span className="font-doodle italic text-primary doodle-underline">today</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Real sessions, happening soon. Sign up to reserve your spot.
            </p>
          </div>

          <Button asChild variant="outline" className="rounded-full gap-2 sketch-border-sm self-start md:self-auto">
            <Link to={scheduleLink}>
              See full schedule <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-primary/25 bg-primary/[0.035] py-14 text-center space-y-3 sketch-border-lg">
            <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
              <Zap className="size-6 text-primary" />
            </div>
            <p className="relative text-lg font-semibold">New sessions are on their way</p>
            <p className="relative text-sm text-muted-foreground">Check back soon for your next chance to practise live.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((room) => (
              <SessionRow key={room.id} room={room} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

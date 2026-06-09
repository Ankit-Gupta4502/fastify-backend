import {  useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { planQueryOptions } from "@/hooks/use-plans";
import { demoQueryOptions } from "@/hooks/use-demo";
import { cn } from "@/lib/utils";



/**
 * Sticky bottom CTA that appears once the hero scrolls out of view.
 * Uses IntersectionObserver (Vercel best practice) instead of scroll events
 * to avoid layout-thrashing passive-listener patterns.
 */
export function StickyTrialBar() {
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Only fetch for authenticated users — skip the API calls entirely for guests
  const { data: planData } = useQuery({
    ...planQueryOptions.mine(),
    enabled: isAuthenticated,
  });
  const { data: demoData } = useQuery({
    ...demoQueryOptions.myRequests(),
    enabled: isAuthenticated,
  });

  const hasPaidPlan = Boolean(planData?.data?.plan);
  const hasActiveOrCompletedDemo = Boolean(
    demoData?.data?.some((r) =>
      ["pending", "approved", "instructor_assigned", "meeting_scheduled", "completed"].includes(
        r.status,
      ),
    ),
  );
  // Suppress the bar once the user already has a plan or a demo in progress/done
  const suppress = isAuthenticated && (hasPaidPlan || hasActiveOrCompletedDemo);

  const handleGetStarted = () => {
    localStorage.setItem("demoClassIntent", "true");
    void navigate({ to: isAuthenticated ? "/demo" : "/login" });
  };



  const show =  !isDismissed && !suppress;

  return (
    <div
      className={cn(
        "fixed bottom-0 inset-x-0 z-40 transition-all duration-500 ease-out",
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none",
      )}
      aria-hidden={!show}
    >
      {/* Backdrop blur bar */}
      <div className="mx-4 mb-4 md:mx-auto md:max-w-lg">
        <div className="relative bg-card/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl shadow-black/10 px-5 py-4 flex items-center gap-4 sketch-border-sm">
          {/* Glow */}
          <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />

          <div className="flex-1 min-w-0 relative">
            <p className="font-bold text-sm truncate">1st Demo Class free</p>
            <p className="text-xs text-muted-foreground truncate">No credit card required.</p>
          </div>

          <div className="relative shrink-0 group">
            <div className="doodle-glow-ring" />
            <Button
              size="sm"
              className="relative rounded-full px-5 gap-1.5 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-105 transition-all duration-300"
              onClick={handleGetStarted}
            >
              Get started <ArrowRight className="size-3.5" />
            </Button>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-full hover:bg-muted"
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

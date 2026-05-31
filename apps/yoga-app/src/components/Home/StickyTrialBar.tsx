import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StickyTrialBarProps {
  /** Ref of the hero section — bar appears once hero scrolls out of view */
  heroRef: React.RefObject<Element | null>;
}

/**
 * Sticky bottom CTA that appears once the hero scrolls out of view.
 * Uses IntersectionObserver (Vercel best practice) instead of scroll events
 * to avoid layout-thrashing passive-listener patterns.
 */
export function StickyTrialBar({ heroRef }: StickyTrialBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        // Show bar when hero is NO LONGER intersecting (scrolled past)
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(hero);
    return () => observerRef.current?.disconnect();
  }, [heroRef]);

  const show = isVisible && !isDismissed;

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
            <p className="font-bold text-sm truncate">14-day free trial</p>
            <p className="text-xs text-muted-foreground truncate">No credit card required.</p>
          </div>

          <div className="relative shrink-0 group">
            <div className="doodle-glow-ring" />
            <Button
              asChild
              size="sm"
              className="relative rounded-full px-5 gap-1.5 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-105 transition-all duration-300"
            >
              <Link to="/login">
                Get started <ArrowRight className="size-3.5" />
              </Link>
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

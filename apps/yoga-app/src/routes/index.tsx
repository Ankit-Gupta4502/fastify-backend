import { createFileRoute, redirect } from "@tanstack/react-router";
import { PAGE_SEO } from "@/lib/seo";
import { lazy, Suspense, useRef } from "react";
import { getQueryClient } from "@/lib/react-query/query-client.tsx";

// ── Above-fold: imported directly (no lazy split) ─────────────────────────────
import { Hero } from "@/components/Home/Hero";
import { WorkshopChips } from "@/components/Home/WorkshopChips";

// ── Below-fold: code-split with React.lazy ────────────────────────────────────
// Vercel best practice: split every non-critical section so the initial bundle
// only includes what the user sees immediately.
const WorkshopsSection   = lazy(() => import("@/components/Home/WorkshopsSection").then(m => ({ default: m.WorkshopsSection })));
const LiveScheduleSection = lazy(() => import("@/components/Home/LiveScheduleSection").then(m => ({ default: m.LiveScheduleSection })));
const QuizSection        = lazy(() => import("@/components/Home/QuizSection").then(m => ({ default: m.QuizSection })));
const InstructorSpotlight = lazy(() => import("@/components/Home/InstructorSpotlight").then(m => ({ default: m.InstructorSpotlight })));
const Features           = lazy(() => import("@/components/Home/Features").then(m => ({ default: m.Features })));
const Process            = lazy(() => import("@/components/Home/Process").then(m => ({ default: m.Process })));
const Reviews            = lazy(() => import("@/components/Home/Reviews").then(m => ({ default: m.Reviews })));
const StickyTrialBar     = lazy(() => import("@/components/Home/StickyTrialBar").then(m => ({ default: m.StickyTrialBar })));

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  head: () => PAGE_SEO.home,
  // After Google OAuth the user lands here. If they originally clicked the
  // "Get started" CTA we stored a flag — consume it and send them to /demo.
  beforeLoad: ({ context }) => {
    if (
      context.user &&
      typeof window !== "undefined" &&
      localStorage.getItem("demoClassIntent")
    ) {
      localStorage.removeItem("demoClassIntent");
      throw redirect({ to: "/demo" });
    }
  },
  // Parallel prefetch: kick off all public data fetches before the component
  // tree even renders. Vercel best practice: avoid request waterfalls by
  // co-locating data requirements with the route.
  loader: async () => {
    const qc = getQueryClient();
    const { roomQueryOptions }    = await import("@/hooks/use-rooms");
    const { reviewQueryOptions }  = await import("@/hooks/use-reviews");
    const { instructorQueryOptions } = await import("@/hooks/use-instructors");

    // Fire-and-forget: all three run in parallel, results land in cache before
    // the component tree requests them.
    await Promise.allSettled([
      qc.prefetchQuery(roomQueryOptions.publicPreview()),
      qc.prefetchQuery(reviewQueryOptions.public()),
      qc.prefetchQuery(instructorQueryOptions.list()),
    ]);
  },
  component: Home,
});

// ── Fallback ──────────────────────────────────────────────────────────────────

function SectionFallback({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`${height} flex items-center justify-center`}>
      <div className="size-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function Home() {
  // heroRef is passed to StickyTrialBar so it can observe when the hero
  // scrolls out of view — avoids any scroll event listeners.
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="pb-16">
      <WorkshopChips />

      {/* ── Above fold: no Suspense needed ── */}
      <div ref={heroRef}>
        <Hero />
      </div>

      {/* ── Below fold: each section independently suspended ──
          Independent Suspense boundaries mean one slow section never blocks
          the others from rendering (Vercel best practice: parallel streaming). */}

      <Suspense fallback={<SectionFallback height="h-48" />}>
        <LiveScheduleSection />
      </Suspense>

      <Suspense fallback={<SectionFallback height="h-[560px]" />}>
        <QuizSection />
      </Suspense>

      <Suspense fallback={<SectionFallback height="h-[700px]" />}>
        <Reviews />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <InstructorSpotlight />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <WorkshopsSection />
      </Suspense>

      <Suspense fallback={<SectionFallback height="h-96" />}>
        <Process />
      </Suspense>

      <Suspense fallback={<SectionFallback height="h-[640px]" />}>
        <Features />
      </Suspense>

      {/* StickyTrialBar observes heroRef — no scroll listener, no layout jank */}
      <Suspense fallback={null}>
        <StickyTrialBar  />
      </Suspense>
    </div>
  );
}

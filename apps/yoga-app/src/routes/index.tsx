import { createFileRoute } from "@tanstack/react-router";
import { PAGE_SEO } from "@/shared/lib/seo";
import { lazy, Suspense, useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getStoredUtm, hasSavedAcquisition, markAcquisitionSaved } from "@/shared/lib/utm";
import { userPreferencesApi } from "@/api/user-preferences";
import { getQueryClient } from "@/lib/react-query/query-client.tsx";

// ── Above-fold: imported directly (no lazy split) ─────────────────────────────
import { Hero } from "@/features/marketing/components/hero";
import { WorkshopChips } from "@/features/workshops/components/workshop-chips";

// ── Below-fold: code-split with React.lazy ────────────────────────────────────
// Vercel best practice: split every non-critical section so the initial bundle
// only includes what the user sees immediately.
const WorkshopsSection   = lazy(() => import("@/features/workshops/components/workshops-section").then(m => ({ default: m.WorkshopsSection })));
const LiveScheduleSection = lazy(() => import("@/features/marketing/components/live-schedule-section").then(m => ({ default: m.LiveScheduleSection })));
const QuizSection        = lazy(() => import("@/features/marketing/components/quiz-section").then(m => ({ default: m.QuizSection })));
const InstructorSpotlight = lazy(() => import("@/features/instructor/components/instructor-spotlight/index").then(m => ({ default: m.InstructorSpotlight })));
const Features           = lazy(() => import("@/features/marketing/components/features").then(m => ({ default: m.Features })));
const Process            = lazy(() => import("@/features/marketing/components/process").then(m => ({ default: m.Process })));
const Reviews            = lazy(() => import("@/features/reviews/components/reviews").then(m => ({ default: m.Reviews })));

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  head: () => PAGE_SEO.home,
  // Parallel prefetch: kick off all public data fetches before the component
  // tree even renders. Vercel best practice: avoid request waterfalls by
  // co-locating data requirements with the route.
  loader: async () => {
    const qc = getQueryClient();

    const { roomQueryOptions }    = await import("@/features/booking/hooks/use-rooms");
    const { reviewQueryOptions }  = await import("@/features/reviews/hooks/use-reviews");
    const { instructorQueryOptions } = await import("@/features/instructor/hooks/use-instructors");

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
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (!isAuthenticated || hasSavedAcquisition()) return;
    const utm = getStoredUtm();
    if (!utm) return;
    userPreferencesApi.saveAcquisition(utm).then(() => markAcquisitionSaved()).catch(() => {});
  }, [isAuthenticated]);

  return (
    <div className="pb-16">
      <WorkshopChips />

      {/* ── Above fold: no Suspense needed ── */}
      <div>
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

    </div>
  );
}

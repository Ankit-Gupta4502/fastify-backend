import { createFileRoute } from "@tanstack/react-router";
import { PAGE_SEO } from "@/shared/lib/seo";
import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getStoredUtm, hasSavedAcquisition, markAcquisitionSaved } from "@/shared/lib/utm";
import { userPreferencesApi } from "@/api/user-preferences";
import { getQueryClient } from "@/lib/react-query/query-client.tsx";

// ── Above-fold: imported directly (no lazy split) ─────────────────────────────
import { Hero } from "@/features/marketing/components/hero";
import { WorkshopChips } from "@/features/workshops/components/workshop-chips";

import { WorkshopsSection } from "@/features/workshops/components/workshops-section";
import { LiveScheduleSection } from "@/features/marketing/components/live-schedule-section";
import { QuizSection } from "@/features/marketing/components/quiz-section";
import { InstructorSpotlight } from "@/features/instructor/components/instructor-spotlight";
import { Features } from "@/features/marketing/components/features";
import { Process } from "@/features/marketing/components/process";
import { Reviews } from "@/features/reviews/components/reviews";

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
    const { workshopQueryOptions } = await import("@/features/workshops/hooks/use-workshops");

    // Fetch every home-page data source in parallel so section hooks read from
    // the cache on their first render.
    await Promise.allSettled([
      qc.prefetchQuery(roomQueryOptions.publicPreview()),
      qc.prefetchQuery(reviewQueryOptions.public()),
      qc.prefetchQuery(instructorQueryOptions.list()),
      qc.prefetchQuery(workshopQueryOptions.list()),
    ]);
  },
  component: Home,
});

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

      <LiveScheduleSection />
      <QuizSection />
      <Reviews />
      <InstructorSpotlight />
      <WorkshopsSection />
      <Process />
      <Features />

    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Home/Hero";
import { Process } from "@/components/Home/Process";
import { Reviews } from "@/components/Home/Reviews";
import { Features } from "@/components/Home/Features";
import { WorkshopsSection } from "@/components/Home/WorkshopsSection";
import { WorkshopChips } from "@/components/Home/WorkshopChips";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="pb-16">
      <WorkshopChips />
      <div className="space-y-4">
        <Hero />
        <Reviews />
        <WorkshopsSection />
        <Process />
        <Features />
      </div>
    </div>
  );
}

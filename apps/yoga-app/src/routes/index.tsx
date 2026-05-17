import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/Home/Hero";
import { Reviews } from "@/components/Home/Reviews";
import { Features } from "@/components/Home/Features";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="space-y-12 pb-16">
      <Hero />
      <Reviews />
      <Features />
    </div>
  );
}

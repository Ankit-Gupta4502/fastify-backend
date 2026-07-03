import { createFileRoute } from "@tanstack/react-router";
import { PAGE_SEO } from "@/lib/seo";
import { Sparkles } from "lucide-react";
import { useInstructors } from "@/hooks/use-instructors";
import { ExpertCard } from "@/components/shared/ExpertCard";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/experts/")({
  head: () => PAGE_SEO.experts,
  component: ExpertsPage,
});

function ExpertsPage() {
  const { data, isLoading } = useInstructors();
  const instructors = data?.data ?? [];

  return (
    <div className="py-12 space-y-12">
      <div className="max-w-2xl space-y-4">
        <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md inline-block">
          Our Guides
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground">
          Meet the <span className="italic text-primary">Experts</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed border-l-2 border-primary/10 pl-6">
          Learn from world-class instructors dedicated to your holistic well-being and mindful growth.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl" />
            ))
          : instructors.map((instructor, i) => (
              <ExpertCard key={instructor.id} instructor={instructor} index={i} />
            ))}
        {!isLoading && instructors.length === 0 && (
          <div className="col-span-3">
            <EmptyState
              icon={Sparkles}
              title="No instructors yet."
              description="Check back soon."
              variant="plain"
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { EXPERTS } from "@/constants/experts";
import { ExpertCard } from "./_components/ExpertCard";

export const Route = createFileRoute("/experts")({
  component: ExpertsPage,
});

function ExpertsPage() {
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
        {EXPERTS.map((expert) => (
          <ExpertCard key={expert.id} expert={expert} />
        ))}
      </div>
    </div>
  );
}

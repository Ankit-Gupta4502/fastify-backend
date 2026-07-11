import { Skeleton } from "@/components/ui/skeleton";
import { useWorkshops } from "@/features/workshops/hooks/use-workshops";
import { WorkshopCard } from "@/features/workshops/components/workshop-card";

export function WorkshopsSection() {
  const { data, isLoading } = useWorkshops();
  const workshops = data?.data ?? [];

  if (!isLoading && workshops.length === 0) return null;

  return (
    <section className="py-16 relative">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-primary/30" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Live Events</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-[1.1]">
              Upcoming <span className="italic text-primary">Workshops</span>
            </h2>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Join live workshops hosted by expert instructors. Reserve your spot with just your email — no account needed.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((w) => (
              <WorkshopCard key={w.id} workshop={w} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

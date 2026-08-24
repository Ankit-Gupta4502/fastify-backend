import { useWorkshops } from "@/features/workshops/hooks/use-workshops";
import { WorkshopCard } from "@/features/workshops/components/workshop-card";
import { Sparkles } from "lucide-react";

export function WorkshopsSection() {
  const { data, isLoading } = useWorkshops();
  const workshops = data?.data ?? [];

  // Workshops are optional content: do not reserve page space while they load
  // or when there is nothing current to show.
  if (isLoading || workshops.length === 0) return null;

  return (
    <section className="relative py-20">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />

      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="relative overflow-hidden rounded-[2rem] border border-primary/10 bg-card/50 px-5 py-8 shadow-sm shadow-primary/5 sm:px-8 md:px-10">
          <div className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/8 blur-3xl" />
          <div className="relative flex flex-col gap-10">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3.5 py-1.5">
                <Sparkles className="size-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">Live events</span>
              </div>
              <h2 className="text-4xl font-serif font-bold leading-[1.05] tracking-tight md:text-5xl">
                Make a date with your <span className="font-doodle italic text-primary doodle-underline">practice.</span>
              </h2>
              <p className="max-w-xl leading-relaxed text-muted-foreground">
                Join a live workshop led by an experienced teacher. Save your spot in a few clicks — no account needed.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {workshops.map((w) => (
                <WorkshopCard key={w.id} workshop={w} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

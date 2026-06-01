import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIntersection } from "@/hooks/use-intersection";
import { useInstructors } from "@/hooks/use-instructors";
import { ExpertCard } from "@/routes/experts/_components/ExpertCard";
import { CardSkeleton } from "./CardSkeleton";

function InstructorSpotlightRoot() {
  const [sectionRef, isVisible] = useIntersection<HTMLElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useInstructors();

  const instructors = data?.data ?? [];

  if (!isLoading && instructors.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -272 : 272, behavior: "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className={cn(
        "py-16 relative overflow-hidden transition-all duration-700 delay-150",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] bg-primary/4 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-primary/30" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Your Guides</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
              Meet the{" "}
              <span className="font-doodle italic text-primary doodle-underline">instructors</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              People don't subscribe to platforms — they follow great teachers.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {(["left", "right"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                className="size-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                aria-label={`Scroll ${dir}`}
              >
                {dir === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
              </button>
            ))}
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {isLoading
            ? [...Array(4)].map((_, i) => <CardSkeleton key={i} />)
            : instructors.map((instructor, i) => (
                <div key={instructor.id} className="snap-start flex-none w-64">
                  <ExpertCard instructor={instructor} index={i} />
                </div>
              ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button asChild variant="outline" className="rounded-full gap-2 sketch-border-sm">
            <Link to="/experts">All instructors <ArrowRight className="size-3.5" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

InstructorSpotlightRoot.CardSkeleton = CardSkeleton;

export const InstructorSpotlight = InstructorSpotlightRoot;

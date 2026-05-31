import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Star, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useIntersection } from "@/hooks/use-intersection";
import { useInstructors } from "@/hooks/use-instructors";
import type { InstructorListItem } from "@yoga-app/shared";

// ── Instructor card ───────────────────────────────────────────────────────────

const CARD_GRADIENTS = [
  "from-sky-500/10 to-blue-400/5",
  "from-primary/10 to-amber-400/5",
  "from-emerald-500/10 to-teal-400/5",
  "from-violet-500/10 to-purple-400/5",
  "from-rose-500/10 to-pink-400/5",
];

function InstructorCard({
  instructor,
  index,
}: {
  instructor: InstructorListItem;
  index: number;
}) {
  const statusMap: Record<string, { color: string; label: string }> = {
    available: { color: "bg-emerald-500", label: "Available" },
    busy: { color: "bg-amber-500", label: "In session" },
    offline: { color: "bg-muted-foreground/40", label: "Offline" },
  };
  const status = statusMap[instructor.status] ?? statusMap.offline;
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

  return (
    <Link
      to="/experts/$expertId"
      params={{ expertId: instructor.id }}
      className={cn(
        "group flex-none w-60 rounded-3xl border border-border/50 bg-linear-to-br bg-card/80 overflow-hidden",
        "hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300",
        "sketch-border-sm",
        gradient,
      )}
    >
      {/* Top colour strip */}
      <div className="relative h-24 bg-linear-to-br from-primary/8 via-transparent to-transparent flex items-center justify-center overflow-hidden">
        <div className="size-16 rounded-2xl bg-card/70 backdrop-blur-sm border border-border/40 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300 shadow-sm">
          <User className="size-8 text-primary/60" />
        </div>
        {/* Status chip */}
        <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border/40 rounded-full px-2.5 py-1 text-[9px] font-bold">
          <span className={cn("size-1.5 rounded-full", status.color)} />
          {status.label}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pt-3 space-y-3">
        <div className="space-y-1">
          <h3 className="font-bold text-sm tracking-tight leading-tight">{instructor.name}</h3>
          {instructor.specialty.length > 0 && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {instructor.specialty.join(" · ")}
            </p>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="size-3 fill-amber-400 text-amber-400" />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1.5 font-semibold">5.0</span>
        </div>

        <div className="flex items-center gap-1 text-primary text-[11px] font-bold group-hover:gap-2 transition-all duration-200">
          View profile <ArrowRight className="size-3" />
        </div>
      </div>
    </Link>
  );
}

function InstructorCardSkeleton() {
  return (
    <div className="flex-none w-60 rounded-3xl border border-border/30 bg-card/50 overflow-hidden">
      <Skeleton className="h-24 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-32 rounded-full" />
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function InstructorSpotlight() {
  const [sectionRef, isVisible] = useIntersection<HTMLElement>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useInstructors();

  const instructors = data?.data ?? [];

  // Don't render the section at all once loading is done and there's nobody
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
      {/* Ambient glow */}
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
            {["left", "right"].map((dir) => (
              <button
                key={dir}
                onClick={() => scroll(dir as "left" | "right")}
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
            ? [...Array(4)].map((_, i) => <InstructorCardSkeleton key={i} />)
            : instructors.map((instructor, i) => (
                <div key={instructor.id} className="snap-start">
                  <InstructorCard instructor={instructor} index={i} />
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

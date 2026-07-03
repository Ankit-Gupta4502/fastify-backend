import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicReviews } from "@/hooks/use-reviews";
import { useIntersection } from "@/hooks/use-intersection";
import { Skeleton } from "@/components/ui/skeleton";
import { StarDoodle } from "@/components/shared/doodles";
import { FALLBACK_REVIEWS } from "./Reviews/reviews-data";
import { ReviewCard } from "./Reviews/ReviewCard";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="break-inside-avoid bg-card border border-border/40 rounded-3xl p-7 space-y-5">
      <div className="flex gap-1">{[...Array(5)].map((_, i) => <Skeleton key={i} className="size-3.5 rounded-full" />)}</div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
        <Skeleton className="h-4 w-2/3 rounded-full" />
      </div>
      <div className="flex items-center gap-3 pt-4 border-t border-border/30">
        <Skeleton className="size-9 rounded-xl shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-2.5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Stat block ────────────────────────────────────────────────────────────────

function StatBlock({ value, label, delay, isVisible }: { value: string; label: string; delay: number; isVisible: boolean }) {
  return (
    <div
      className={cn(
        "text-center group cursor-default transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-5xl font-doodle font-bold text-primary/85 group-hover:text-primary transition-colors duration-300 leading-none mb-2">
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function Reviews() {
  const [sectionRef, isVisible] = useIntersection<HTMLElement>({ threshold: 0.05 });
  const { data, isLoading } = usePublicReviews();

  const reviews = data?.data?.length ? data.data : FALLBACK_REVIEWS;

  return (
    <section id="reviews" ref={sectionRef} className="py-24 relative overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/60 to-transparent" />
        <div className="absolute top-1/4 left-1/4 size-[600px] bg-primary/4 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 size-[500px] bg-accent/4 blur-[130px] rounded-full" />
        <StarDoodle className="absolute top-16 left-[8%] size-5 text-primary/15 animate-doodle-float" />
        <StarDoodle className="absolute top-32 right-[10%] size-3 text-accent/20 animate-doodle-float-alt" style={{ animationDelay: "1s" }} />
        <StarDoodle className="absolute bottom-24 left-[15%] size-4 text-primary/12 animate-doodle-float-alt" style={{ animationDelay: "1.8s" }} />
        <StarDoodle className="absolute bottom-40 right-[8%] size-3 text-primary/15 animate-doodle-float" style={{ animationDelay: "0.5s" }} />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div
          className={cn(
            "flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          )}
        >
          <div className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-primary/30" />
              <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Voices of Peace</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-[1.12]">
              Loved by the{" "}
              <span className="font-doodle italic text-primary doodle-underline">global sangha</span>
            </h2>
          </div>

          {/* Aggregate rating pill */}
          <div className="flex items-center gap-5 bg-card border border-border/50 rounded-2xl px-6 py-4 shadow-sm shrink-0 self-start md:self-auto sketch-border-sm">
            <div className="text-center">
              <p className="text-3xl font-doodle font-bold text-primary leading-none">5.0</p>
              <div className="flex gap-0.5 mt-1.5 justify-center">
                {[...Array(5)].map((_, i) => <Star key={i} className="size-3 fill-amber-400 text-amber-400" />)}
              </div>
            </div>
            <div className="h-10 w-px bg-border/50" />
            <div>
              <p className="font-bold text-sm">1,000+</p>
              <p className="text-[11px] text-muted-foreground">happy practitioners</p>
            </div>
          </div>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {isLoading
            ? [...Array(6)].map((_, i) => <ReviewSkeleton key={i} />)
            : reviews.map((review, i) => (
                <ReviewCard key={review.id} review={review} index={i} isVisible={isVisible} />
              ))}
        </div>

        {/* Stats strip */}
        <div
          className={cn(
            "mt-20 relative rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm px-8 py-10 overflow-hidden sketch-border-lg",
            "transition-all duration-700 delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
          )}
        >
          <div className="absolute inset-0 bg-linear-to-br from-primary/4 via-transparent to-accent/4 pointer-events-none" />
          <div className="relative grid grid-cols-2 divide-x divide-border/40">
            <StatBlock value="1k+"  label="Mindful souls" delay={250} isVisible={isVisible} />
            <StatBlock value="98%"  label="Calm index"    delay={350} isVisible={isVisible} />
          </div>
        </div>
      </div>
    </section>
  );
}

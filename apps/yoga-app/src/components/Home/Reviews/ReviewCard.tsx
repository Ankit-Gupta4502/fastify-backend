import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicReview } from "./reviews-data";

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

function QuoteMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 52" fill="currentColor" className={className} aria-hidden>
      <path d="M0 52V31.2C0 14.04 10.4 4.16 31.2 0l5.2 7.8C24.44 10.4 18.2 16.64 18.2 24.7H27.3V52H0zm36.4 0V31.2C36.4 14.04 46.8 4.16 67.6 0l5.2 7.8C60.84 10.4 54.6 16.64 54.6 24.7H63.7V52H36.4z"/>
    </svg>
  );
}

export function ReviewCard({ review, index, isVisible }: { review: PublicReview; index: number; isVisible: boolean }) {
  return (
    <div
      className={cn(
        "break-inside-avoid transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
      )}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="group relative bg-card border border-border/50 rounded-3xl p-7 space-y-5 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/6 hover:border-border/80 transition-all duration-300">
        {/* Decorative quote mark — only accent in the card */}
        <QuoteMark className="absolute top-5 right-6 size-9 text-primary/10 group-hover:text-primary/18 group-hover:scale-110 transition-all duration-400" />

        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("size-3.5", i < review.rating ? "fill-amber-400 text-amber-400" : "text-border")} />
          ))}
        </div>

        {/* Quote */}
        <p className="font-serif italic text-[15px] leading-[1.8] text-foreground/75 group-hover:text-foreground/90 transition-colors duration-300">
          "{review.comment}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/40">
          <div className="size-9 rounded-xl bg-muted flex items-center justify-center font-bold text-[11px] text-foreground/70 shrink-0">
            {initials(review.userName)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm">{review.userName}</p>
              <CheckCircle2 className="size-3.5 text-primary/40 group-hover:text-primary/70 transition-colors duration-300" />
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
              Solara member
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

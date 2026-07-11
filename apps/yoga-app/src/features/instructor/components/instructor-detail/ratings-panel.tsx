import { Star } from "lucide-react";
import { useInstructorDetail } from "./context";

export function RatingsPanel() {
  const { instructor } = useInstructorDetail();
  const pct = Math.max(0, Math.min(100, (instructor.rating / 5) * 100));

  return (
    <div className="rounded-2xl border border-border overflow-hidden grid grid-cols-1 md:grid-cols-[240px_1fr]">
      <div className="bg-linear-to-br from-primary to-primary/70 text-primary-foreground p-8 flex flex-col items-center justify-center gap-3 text-center">
        <span className="font-serif text-6xl sm:text-7xl leading-none">{instructor.rating.toFixed(1)}</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="size-4"
              fill={i < Math.round(instructor.rating) ? "currentColor" : "none"}
            />
          ))}
        </div>
        <p className="text-[11px] uppercase tracking-[0.2em] opacity-85">Instructor Rating</p>
      </div>

      <div className="p-6 sm:p-8 flex flex-col justify-center gap-3">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Overall score</span>
          <span className="text-muted-foreground">{instructor.rating.toFixed(1)} / 5.0</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">
          Rating curated by our team based on instructor performance.
        </p>
      </div>
    </div>
  );
}

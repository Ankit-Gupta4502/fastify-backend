import { cn } from "@/lib/utils";
import { useExpertCard } from "./context";

export function Content() {
  const { instructor, accent } = useExpertCard();

  return (
    <div className="flex flex-col flex-1 px-5 pt-12 pb-4 space-y-3">
      <div>
        <h3 className="text-base font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
          {instructor.name}
        </h3>
        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mt-0.5">
          {instructor.specialty[0] ?? "Yoga Instructor"}
        </p>
        {instructor.tagline && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {instructor.tagline}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1 flex-1">
        {instructor.specialty.map((s) => (
          <span
            key={s}
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-wide border border-transparent",
              accent.badge,
            )}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

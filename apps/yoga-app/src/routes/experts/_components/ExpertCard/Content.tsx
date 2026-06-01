import { cn } from "@/lib/utils";
import { useExpertCard } from "./context";

export function Content() {
  const { instructor, accent } = useExpertCard();

  return (
    <div className="flex flex-col flex-1 p-6 space-y-4">
      <div>
        <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
          {instructor.name}
        </h3>
        <p className="text-[11px] font-bold text-primary/70 uppercase tracking-widest mt-0.5">
          {instructor.specialty[0] ?? "Yoga Instructor"}
        </p>
        {instructor.tagline && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
            {instructor.tagline}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 flex-1">
        {instructor.specialty.map((s) => (
          <span
            key={s}
            className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide border border-transparent",
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

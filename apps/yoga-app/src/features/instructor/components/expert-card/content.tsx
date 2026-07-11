import { Chip } from "@/shared/components/misc/chip";
import { useExpertCard } from "./context";

export function Content() {
  const { instructor } = useExpertCard();

  return (
    <div className="flex flex-col flex-1 px-4 pt-3.5 pb-1.5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-serif text-xl font-medium leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-300">
          {instructor.name}
        </h3>
        {instructor.yearsOfExperience != null && (
          <Chip variant="muted" size="sm" className="shrink-0">
            {instructor.yearsOfExperience}{instructor.yearsOfExperience === 1 ? "yr" : "yrs"} exp
          </Chip>
        )}
      </div>

      {instructor.tagline ? (
        <p className="mt-1 text-xs italic leading-snug text-foreground/55 line-clamp-2">
          {instructor.tagline}
        </p>
      ) : (
        instructor.specialty[0] && (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-primary line-clamp-1">
            {instructor.specialty[0]}
          </p>
        )
      )}
    </div>
  );
}

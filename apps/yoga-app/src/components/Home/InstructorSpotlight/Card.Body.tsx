import { Star, ArrowRight } from "lucide-react";
import { useCard } from "./card-context";

export function CardBody() {
  const { instructor } = useCard();

  return (
    <div className="px-5 pb-5 pt-3 space-y-3">
      <div className="space-y-1">
        <h3 className="font-bold text-sm tracking-tight leading-tight">{instructor.name}</h3>
        {instructor.specialty.length > 0 && (
          <p className="text-[11px] text-muted-foreground line-clamp-1">
            {instructor.specialty.join(" · ")}
          </p>
        )}
        {instructor.tagline && (
          <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed pt-0.5">
            {instructor.tagline}
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
  );
}

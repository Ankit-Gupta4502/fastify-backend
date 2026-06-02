import { cn } from "@/lib/utils";
import { useInstructorDetail } from "./context";
import { ContentSection, ContentHeading } from "./primitives";
import { accentColors } from "./config";

export function Expertise() {
  const { instructor } = useInstructorDetail();
  if (instructor.specialty.length === 0) return null;

  return (
    <ContentSection>
      <ContentHeading accent="Expertise">Areas of</ContentHeading>
      <div className="space-y-2.5">
        {instructor.specialty.map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-card/50 hover:border-primary/20 hover:bg-card/80 transition-all duration-200 sketch-border-sm"
          >
            <div className={cn(
              "size-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 bg-linear-to-br shadow-sm",
              accentColors[i % accentColors.length],
            )}>
              {s.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{s}</p>
              <p className="text-xs text-muted-foreground">Certified specialty</p>
            </div>
          </div>
        ))}
      </div>
    </ContentSection>
  );
}

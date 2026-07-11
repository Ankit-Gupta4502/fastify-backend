import { useInstructorDetail } from "./context";
import { ContentSection, ContentHeading } from "./primitives";

export function Expertise() {
  const { instructor } = useInstructorDetail();

  const items = Array.from(
    new Map(
      [...instructor.specialty, ...instructor.tags].map((item) => [item.toLowerCase(), item]),
    ).values(),
  );

  if (items.length === 0) return null;

  return (
    <ContentSection>
      <ContentHeading>Expertise</ContentHeading>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
        {items.map((item, i) => (
          <div key={item} className="flex items-baseline gap-4 py-4 border-b border-border/60">
            <span className="font-serif text-2xl text-primary/80 min-w-9 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="  capitalize text-sm font-medium">{item}</p>
          </div>
        ))}
      </div>
    </ContentSection>
  );
}

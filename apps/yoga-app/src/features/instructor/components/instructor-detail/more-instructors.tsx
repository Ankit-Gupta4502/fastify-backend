import { useInstructors } from "@/features/instructor/hooks/use-instructors";
import { useInstructorDetail } from "./context";
import { ContentSection, ContentHeading } from "./primitives";
import { InstructorMiniCard } from "./instructor-mini-card";

export function MoreInstructors() {
  const { instructor } = useInstructorDetail();
  const { data } = useInstructors();

  const others = (data?.data ?? []).filter((i) => i.id !== instructor.id).slice(0, 3);
  if (others.length === 0) return null;

  return (
    <ContentSection>
      <ContentHeading>More Instructors</ContentHeading>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {others.map((other) => (
          <InstructorMiniCard key={other.id} instructor={other} />
        ))}
      </div>
    </ContentSection>
  );
}

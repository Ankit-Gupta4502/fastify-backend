import { useInstructorDetail } from "./context";
import { ContentSection, ContentHeading } from "./primitives";

export function Bio() {
  const { instructor } = useInstructorDetail();
  if (!instructor.bio) return null;

  return (
    <ContentSection>
      <ContentHeading>About</ContentHeading>
      <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm">{instructor.bio}</p>
    </ContentSection>
  );
}

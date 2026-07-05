import { Chip } from "@/shared/components/misc/chip";
import { useInstructorDetail } from "./context";

export function StylesChips() {
  const { instructor } = useInstructorDetail();
  if (instructor.specialty.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {instructor.specialty.map((style) => (
        <Chip key={style} variant="muted" size="md">
          {style}
        </Chip>
      ))}
    </div>
  );
}

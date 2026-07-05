import { useInstructorDetail } from "./context";

export function Bio() {
  const { instructor } = useInstructorDetail();
  if (!instructor.bio) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-3 md:gap-8 lg:gap-14">
      <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">About</p>
      <p className="text-base sm:text-lg font-serif leading-relaxed text-foreground/90 whitespace-pre-line max-w-2xl">
        {instructor.bio}
      </p>
    </div>
  );
}

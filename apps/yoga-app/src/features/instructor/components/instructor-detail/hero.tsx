import { InstructorAvatar } from "@/shared/components/misc/instructor-avatar";
import { useInstructorDetail } from "./context";
import { StatStrip } from "./stat-strip";
import { StylesChips } from "./styles-chips";

export function Hero() {
  const { instructor } = useInstructorDetail();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr] gap-8 lg:gap-14 items-stretch">
      <InstructorAvatar
        src={instructor.profileImageUrl}
        name={instructor.name}
        className="w-full aspect-4/5 md:aspect-auto md:h-full rounded-2xl shadow-[0_24px_50px_-28px_rgba(0,0,0,0.35)]"
        fallbackClassName="bg-muted"
        initialsClassName="text-4xl font-serif text-muted-foreground"
      />

      <div className="flex flex-col justify-center gap-5 min-w-0">
        <div className="space-y-2">
          <h1 className="font-serif font-medium tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl">
            {instructor.name}
          </h1>
          {instructor.tagline ? (
            <p className="font-serif italic text-lg text-muted-foreground max-w-xl">{instructor.tagline}</p>
          ) : instructor.specialty.length > 0 ? (
            <p className="font-serif italic text-lg text-muted-foreground max-w-xl">
              {instructor.specialty.join(" · ")}
            </p>
          ) : null}
        </div>

        <StatStrip />
        <StylesChips />
      </div>
    </div>
  );
}

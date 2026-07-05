import { Star } from "lucide-react";
import { useInstructorDetail } from "./context";

export function StatStrip() {
  const { instructor } = useInstructorDetail();

  const stats = [
    {
      value: instructor.yearsOfExperience != null ? `${instructor.yearsOfExperience}` : "New",
      label: instructor.yearsOfExperience != null ? "Years Teaching" : "Instructor",
    },
    {
      value: `${instructor.specialty.length}`,
      label: instructor.specialty.length === 1 ? "Style Taught" : "Styles Taught",
    },
    {
      value: (
        <span className="inline-flex items-center gap-1.5">
          {instructor.rating.toFixed(1)}
          <Star className="size-5 fill-primary text-primary" />
        </span>
      ),
      label: "Rating",
    },
  ];

  return (
    <div className="grid grid-cols-3 border-y border-border divide-x divide-border">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col items-start gap-1 py-4 px-3 sm:px-5 first:pl-0">
          <span className="font-serif text-3xl sm:text-4xl leading-none">{stat.value}</span>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

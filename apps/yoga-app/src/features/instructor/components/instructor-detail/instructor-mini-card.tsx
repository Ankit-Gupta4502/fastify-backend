import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import type { InstructorListItem } from "@yoga-app/shared";
import { InstructorAvatar } from "@/shared/components/misc/instructor-avatar";

export function InstructorMiniCard({ instructor }: { instructor: InstructorListItem }) {
  return (
    <Link
      to="/experts/$expertId"
      params={{ expertId: instructor.id }}
      className="group block transition-transform duration-200 hover:-translate-y-1.5"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        <InstructorAvatar
          src={instructor.profileImageUrl}
          name={instructor.name}
          className="size-full"
          fallbackClassName="bg-muted"
          initialsClassName="text-3xl font-serif text-muted-foreground"
        />
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-xs font-semibold">
          <Star className="size-3 fill-primary text-primary" />
          {instructor.rating.toFixed(1)}
        </span>
      </div>

      <div className="pt-3 space-y-0.5">
        <p className="font-serif text-xl">{instructor.name}</p>
        {instructor.specialty[0] && (
          <p className="text-sm font-medium text-primary">{instructor.specialty[0]}</p>
        )}
      </div>
    </Link>
  );
}

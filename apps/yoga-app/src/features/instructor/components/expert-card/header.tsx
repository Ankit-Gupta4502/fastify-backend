import { Star } from "lucide-react";
import { InstructorAvatar } from "@/shared/components/misc/instructor-avatar";
import { useExpertCard } from "./context";

export function Header() {
  const { instructor } = useExpertCard();

  return (
    <div className="relative aspect-square overflow-hidden bg-muted">
      <InstructorAvatar
        src={instructor.profileImageUrl}
        name={instructor.name}
        className="size-full"
        fallbackClassName="bg-muted"
        initialsClassName="text-3xl font-serif text-muted-foreground"
      />
      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-background/90 backdrop-blur px-2.5 py-1 text-xs font-semibold">
        <Star className="size-3 fill-primary text-primary" />
        {instructor.rating.toFixed(1)}
      </span>
    </div>
  );
}

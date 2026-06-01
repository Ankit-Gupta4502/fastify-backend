import { cn } from "@/lib/utils";
import { InstructorAvatar } from "@/components/shared/InstructorAvatar";
import { useCard } from "./card-context";

export function CardMedia() {
  const { instructor, status } = useCard();

  return (
    <div className="relative h-24 bg-linear-to-br from-primary/8 via-transparent to-transparent flex items-center justify-center overflow-hidden">
      <InstructorAvatar
        src={instructor.profileImageUrl}
        name={instructor.name}
        className="size-16 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-300"
        fallbackClassName="bg-card/70 backdrop-blur-sm border border-border/40 group-hover:border-primary/30"
        initialsClassName="text-sm font-bold text-primary"
      />
      <span className="absolute top-3 right-3 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm border border-border/40 rounded-full px-2.5 py-1 text-[9px] font-bold">
        <span className={cn("size-1.5 rounded-full", status.color)} />
        {status.label}
      </span>
    </div>
  );
}

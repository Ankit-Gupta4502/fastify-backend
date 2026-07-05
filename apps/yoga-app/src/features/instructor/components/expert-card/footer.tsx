import { ArrowRight } from "lucide-react";
import { useExpertCard } from "./context";

export function Footer() {
  const { instructor } = useExpertCard();

  return (
    <div className="px-4 pb-4 pt-2.5 flex items-center justify-between border-t border-border/60 mt-auto">
      <span className="text-xs font-semibold text-muted-foreground">
        {instructor.currentRoomId ? "Live now" : "View profile"}
      </span>
      <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </div>
  );
}

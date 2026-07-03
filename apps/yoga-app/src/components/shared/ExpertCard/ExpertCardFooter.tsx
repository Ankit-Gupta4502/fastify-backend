import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpertCard } from "./context";

export function Footer() {
  const { instructor } = useExpertCard();

  return (
    <div className="px-6 pb-6 flex items-center justify-between border-t border-border/30 pt-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {instructor.currentRoomId && (
          <span className="text-xs font-semibold">Live now</span>
        )}
      </div>
      <Button
        asChild
        size="sm"
        className="rounded-full px-4 gap-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 hover:border-transparent shadow-none transition-all duration-300 font-semibold"
      >
        <Link to="/experts/$expertId" params={{ expertId: instructor.id }}>
          View Profile
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </div>
  );
}

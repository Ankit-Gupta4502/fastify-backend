import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstructorAvatar } from "@/components/shared/InstructorAvatar";
import { useExpertCard } from "./context";
import { statusConfig } from "./config";

export function Header() {
  const { instructor } = useExpertCard();
  const status = statusConfig[instructor.status];
  const StatusIcon = status.icon;

  return (
    <div className="relative h-32">
      <div className="absolute top-4 left-4 z-10">
        <div className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm",
          status.className,
        )}>
          <StatusIcon className="size-2.5" />
          {status.label}
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border/40 shadow-sm">
          <Award className="size-2.5 text-primary" />
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Expert</span>
        </div>
      </div>

      {/* Circular avatar left-aligned at the header/content boundary */}
      <div className="absolute bottom-0 left-5 translate-y-1/2 z-10">
        <div className="p-1 rounded-full bg-card ring-4 ring-card shadow-xl">
          <InstructorAvatar
            src={instructor.profileImageUrl}
            name={instructor.name}
            className="size-16 rounded-full"
            fallbackClassName="bg-primary"
            initialsClassName="text-xl font-bold text-white"
          />
        </div>
      </div>
    </div>
  );
}

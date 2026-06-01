import { Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstructorAvatar } from "@/components/shared/InstructorAvatar";
import { useExpertCard } from "./context";
import { statusConfig } from "./config";

export function Header() {
  const { instructor, accent } = useExpertCard();
  const status = statusConfig[instructor.status];
  const StatusIcon = status.icon;

  return (
    <div className="relative aspect-4/3 overflow-hidden">
      <div className={cn("absolute inset-0 bg-linear-to-br", accent.gradient)} />

      <div className="absolute inset-0 flex items-center justify-center">
        <InstructorAvatar
          src={instructor.profileImageUrl}
          name={instructor.name}
          className="size-24 rounded-3xl shadow-xl"
          fallbackClassName={cn("bg-linear-to-br", accent.avatar)}
          initialsClassName="text-3xl font-bold text-white"
        />
      </div>

      <div className="absolute top-4 left-4">
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm text-xs font-semibold",
          status.className,
        )}>
          <StatusIcon className="size-3" />
          {status.label}
        </div>
      </div>

      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/20 backdrop-blur-md">
          <Award className="size-3 text-primary" />
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Expert</span>
        </div>
      </div>
    </div>
  );
}

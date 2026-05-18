import { Link } from "@tanstack/react-router";
import { Users, ArrowRight, Award, Radio, Clock, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type InstructorListItem } from "@yoga-app/shared";
import { cn } from "@/lib/utils";

const accentMap: Record<number, { gradient: string; badge: string; avatar: string }> = {
  0: { gradient: "from-violet-500/20 via-purple-500/10 to-transparent", badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400", avatar: "from-violet-500 to-purple-600" },
  1: { gradient: "from-emerald-500/20 via-teal-500/10 to-transparent", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", avatar: "from-emerald-500 to-teal-600" },
  2: { gradient: "from-rose-500/20 via-pink-500/10 to-transparent", badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400", avatar: "from-rose-500 to-pink-600" },
  3: { gradient: "from-amber-500/20 via-orange-500/10 to-transparent", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400", avatar: "from-amber-500 to-orange-600" },
};

const statusConfig = {
  available: { icon: Radio, label: "Available", className: "text-emerald-500 bg-emerald-500/10" },
  busy: { icon: Clock, label: "In Session", className: "text-amber-500 bg-amber-500/10" },
  offline: { icon: WifiOff, label: "Offline", className: "text-muted-foreground bg-muted/50" },
};

export function ExpertCard({ instructor, index = 0 }: { instructor: InstructorListItem; index?: number }) {
  const accent = accentMap[index % 4];
  const status = statusConfig[instructor.status];
  const StatusIcon = status.icon;
  const initials = instructor.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/70 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/25">
      {/* Top shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Image / Avatar area */}
      <div className="relative aspect-4/3 overflow-hidden">
        <div className={cn("absolute inset-0 bg-linear-to-br", accent.gradient)} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "size-24 rounded-3xl bg-linear-to-br flex items-center justify-center text-white text-3xl font-bold shadow-xl",
            accent.avatar
          )}>
            {initials}
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-sm text-xs font-semibold",
            status.className
          )}>
            <StatusIcon className="size-3" />
            {status.label}
          </div>
        </div>

        {/* Expert badge */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/20 backdrop-blur-md">
            <Award className="size-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Expert</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
            {instructor.name}
          </h3>
          <p className="text-[11px] font-bold text-primary/70 uppercase tracking-widest mt-0.5">
            {instructor.specialty[0] ?? "Yoga Instructor"}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 flex-1">
          {instructor.specialty.map((s) => (
            <span
              key={s}
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide border border-transparent",
                accent.badge
              )}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 flex items-center justify-between border-t border-border/30 pt-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex items-center justify-center size-7 rounded-full bg-secondary/60">
            <Users className="size-3.5" />
          </div>
          <span className="text-xs font-semibold">
            {instructor.currentRoomId ? "Live now" : "Open to book"}
          </span>
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
    </div>
  );
}

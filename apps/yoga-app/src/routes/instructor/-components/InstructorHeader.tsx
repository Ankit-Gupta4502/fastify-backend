import { useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { Sparkles } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/instructor/dashboard": "Dashboard",
  "/instructor/earnings": "Earnings",
  "/instructor/profile": "Profile",
};

export function InstructorHeader() {
  const location = useLocation();
  const { user } = useAuthStore();

  const title = PAGE_TITLES[location.pathname] ?? "Instructor Studio";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "IN";

  return (
    <header className="h-16 shrink-0 border-b border-border/60 bg-card/20 backdrop-blur-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {/* Doodle: slow-spinning sparkle for playful feel */}
        <Sparkles className="size-4 text-primary/60 animate-doodle-spin-slow" />
        <h2 className="text-base font-semibold tracking-tight font-doodle">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Live status badge */}
        <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Available
        </span>

        {/* User chip */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border/40">
          <div className="size-6 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
            {initials}
          </div>
          <span className="text-sm font-semibold hidden sm:block">{user?.name?.split(" ")[0]}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/15 text-primary px-2 py-0.5 rounded-full hidden md:block">
            Instructor
          </span>
        </div>
      </div>
    </header>
  );
}

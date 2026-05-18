import { Link } from "@tanstack/react-router";
import { Users, GraduationCap, CalendarDays, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Instructors", to: "/admin/instructors", icon: GraduationCap },
  { label: "Classes", to: "/admin/rooms", icon: CalendarDays },
] as const;

export function AdminNav() {
  return (
    <aside className="w-56 shrink-0 border-r border-border/60 bg-secondary/20 flex flex-col gap-1 p-4">
      <div className="flex items-center gap-2 px-3 py-2 mb-4">
        <ShieldCheck className="size-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Admin</span>
      </div>
      {navItems.map(({ label, to, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary",
          )}
          activeProps={{ className: "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary" }}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </Link>
      ))}
    </aside>
  );
}

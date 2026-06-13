import { Link } from "@tanstack/react-router";
import {
  Users,
  GraduationCap,
  CalendarDays,
  BookOpen,
  ShieldCheck,
  LogOut,
  ClipboardList,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Instructors", to: "/admin/instructors", icon: GraduationCap },
  { label: "Demo Requests", to: "/admin/demo-requests", icon: ClipboardList },
  { label: "Classes", to: "/admin/rooms", icon: CalendarDays },
  { label: "Workshops", to: "/admin/workshops", icon: BookOpen },
  { label: "Reviews", to: "/admin/reviews", icon: Star },
] as const;

export function AdminNav() {
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 shrink-0 border-r border-border/60 bg-card/40 flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border/40">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.svg" alt="" className="size-8 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold leading-none tracking-tight">
            <span className="block text-foreground">Book Your</span>
            <span className="block text-primary font-doodle italic">Yoga Teacher</span>
          </span>
        </Link>
      </div>

      {/* Section label */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-2">
        <ShieldCheck className="size-3.5 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
          Admin Panel
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
            )}
            activeProps={{
              className: "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
            }}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-border/40 p-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{user?.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOut className="size-4 shrink-0" />
          {logout.isPending ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </aside>
  );
}

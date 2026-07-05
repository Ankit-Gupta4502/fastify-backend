import { Link } from "@tanstack/react-router";
import { LayoutDashboard, CalendarRange, IndianRupee, UserCircle, Pencil, LogOut } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";

const navItems = [
  { label: "Dashboard", to: "/instructor/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Schedule", to: "/instructor/dashboard/upcoming", icon: CalendarRange, exact: false },
  { label: "Earnings", to: "/instructor/earnings", icon: IndianRupee, exact: false },
  { label: "Profile", to: "/instructor/profile", icon: UserCircle, exact: false },
] as const;

export function InstructorSidebar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "IN";

  return (
    <aside className="w-64 shrink-0 border-r border-border/60 bg-card/40 flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border/40">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/logo.svg" alt="" className="size-8 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-sm font-bold leading-none tracking-tight">
            <span className="block text-foreground">Book Your</span>
            <span className="block text-primary font-doodle italic">Yoga Teacher</span>
          </span>
        </Link>
      </div>

      {/* Section label — Doodle: rotated pencil for sketch feel */}
      <div className="px-5 pt-6 pb-2 flex items-center gap-2">
        <Pencil className="size-3.5 text-primary -rotate-2" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary font-doodle">
          Instructor Studio
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto py-2">
        {navItems.map(({ label, to, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact }}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
            )}
            activeProps={{
              className:
                "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
            }}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Hand-drawn wavy divider */}
      <div className="px-5 py-1">
        <svg
          width="100%"
          height="10"
          viewBox="0 0 200 10"
          preserveAspectRatio="none"
          className="fill-none stroke-border/50"
        >
          <path
            d="M0 5 Q25 1, 50 5 Q75 9, 100 5 Q125 1, 150 5 Q175 9, 200 5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* User footer */}
      <div className="p-4 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="size-9 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center text-primary shrink-0 text-xs font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate leading-tight">{user?.name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium focus-visible:ring-2 focus-visible:ring-destructive/60"
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

import { Link } from "@tanstack/react-router";
import { User, LogOut, LayoutDashboard, ShieldCheck, Tag } from "lucide-react";
import { USER_ROLES } from "@yoga-app/shared";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const isInstructor = user?.role === USER_ROLES.INSTRUCTOR;
  const isAdmin = user?.role === USER_ROLES.ADMIN;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.svg"
              alt=""
              className="size-8 group-hover:scale-110 transition-transform duration-300"
            />
            <span className="text-sm font-bold leading-none tracking-tight">
              <span className="block text-foreground">Book Your</span>
              <span className="block text-primary font-doodle italic">Yoga Teacher</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/experts"
              className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
            >
              Experts
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>
            <Link
              to="/pricing"
              className="relative flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground group"
            >
              <Tag className="size-3.5 group-hover:text-primary transition-colors duration-200" />
              Pricing
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-28 rounded-full hidden sm:block" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80 border border-border/50 sm:flex hover:bg-secondary transition-colors duration-200">
                <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="size-3.5" />
                </div>
                <span className="text-sm font-semibold">{user?.name}</span>
                {isInstructor && (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                    Instructor
                  </span>
                )}
                {isAdmin && (
                  <span className="text-[9px] font-bold uppercase tracking-widest bg-primary/15 text-primary px-2 py-0.5 rounded-full">
                    Admin
                  </span>
                )}
              </div>

              {isAdmin ? (
                <Button asChild className="rounded-full px-6 shadow-sm hover:shadow-primary/20 transition-all duration-300">
                  <Link to="/admin/rooms" className="flex items-center gap-2">
                    <ShieldCheck className="size-3.5" />
                    <span>Admin</span>
                  </Link>
                </Button>
              ) : (
                <Button asChild className="rounded-full px-6 shadow-sm hover:shadow-primary/20 transition-all duration-300">
                  <Link
                    to={isInstructor ? "/instructor/dashboard" : "/dashboard"}
                    className="flex items-center gap-2"
                  >
                    <LayoutDashboard className="size-3.5" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
                className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                title={logout.isPending ? "Logging out..." : "Log out"}
              >
                <LogOut className={cn("size-4", logout.isPending && "animate-pulse")} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild className="rounded-full px-6" variant="ghost">
                <Link to="/login">Sign in</Link>
              </Button>
              <div className="relative group">
                <div className="doodle-glow-ring opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Button
                  asChild
                  className="relative rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:scale-105 transition-all duration-300 font-semibold"
                >
                  <Link to="/login">Get started</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { User, LogOut, LayoutDashboard, ShieldCheck, Tag, Menu, BookOpen, Home } from "lucide-react";
import { USER_ROLES } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/experts", label: "Experts", icon: BookOpen },
  { to: "/pricing", label: "Pricing", icon: Tag },
] as const;

export function RootHeader() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const isInstructor = user?.role === USER_ROLES.INSTRUCTOR;
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardTo = isAdmin
    ? "/admin/rooms"
    : isInstructor
    ? "/instructor/dashboard"
    : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.svg"
              alt=""
              className="size-10 group-hover:scale-110 transition-transform duration-300"
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

        {/* Right: auth actions + mobile hamburger */}
        <div className="flex items-center gap-3">
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

              <Button
                asChild
                className="hidden md:inline-flex rounded-full px-6 shadow-sm hover:shadow-primary/20 transition-all duration-300"
              >
                <Link to={dashboardTo} className="flex items-center gap-2">
                  {isAdmin ? <ShieldCheck className="size-3.5" /> : <LayoutDashboard className="size-3.5" />}
                  <span>{isAdmin ? "Admin" : "Dashboard"}</span>
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="icon-sm"
                disabled={logout.isPending}
                onClick={() => logout.mutate()}
                className="hidden md:inline-flex rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                title={logout.isPending ? "Logging out..." : "Log out"}
              >
                <LogOut className={cn("size-4", logout.isPending && "animate-pulse")} />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
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

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="md:hidden rounded-xl"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 p-0 flex flex-col">
              <SheetHeader className="px-6 pt-6 pb-4">
                <SheetTitle asChild>
                  <Link
                    to="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <img src="/logo.svg" alt="" className="size-9" />
                    <span className="text-sm font-bold leading-none tracking-tight">
                      <span className="block text-foreground">Book Your</span>
                      <span className="block text-primary font-doodle italic">Yoga Teacher</span>
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <Separator />

              {/* Nav links */}
              <nav className="flex flex-col gap-1 px-3 py-4">
                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-200"
                    activeProps={{ className: "text-foreground bg-primary/8 hover:bg-primary/12" }}
                    activeOptions={to === "/" ? { exact: true } : undefined}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                ))}
              </nav>

              <Separator />

              {/* Auth section */}
              <div className="px-4 py-4 mt-auto space-y-3">
                {isAuthenticated ? (
                  <>
                    {/* User chip */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-muted/60 border border-border/50">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <User className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                        {(isInstructor || isAdmin) && (
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                            {isAdmin ? "Admin" : "Instructor"}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      asChild
                      className="w-full rounded-xl gap-2"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link to={dashboardTo}>
                        {isAdmin ? <ShieldCheck className="size-4" /> : <LayoutDashboard className="size-4" />}
                        {isAdmin ? "Admin panel" : "Dashboard"}
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full rounded-xl gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                      disabled={logout.isPending}
                      onClick={() => { logout.mutate(); setMobileOpen(false); }}
                    >
                      <LogOut className={cn("size-4", logout.isPending && "animate-pulse")} />
                      {logout.isPending ? "Logging out…" : "Log out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Link to="/login">Get started free</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

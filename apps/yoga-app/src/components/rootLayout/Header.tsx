import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const navigationItems = [
  { label: "Features", href: "#features" },
  { label: "Register", href: "#register" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Sparkles className="size-4" />
            </span>
            <div className="leading-tight">
              <p className="font-serif text-xl text-foreground">Solara</p>
              <p className="text-xs text-muted-foreground">
                Yoga & mindfulness workspace
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navigationItems.map((item) => (
              <a
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
            <Link
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              to="/"
            >
              Login
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden rounded-full px-4 sm:inline-flex" variant="ghost">
            <Link to="/">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full px-5">
            <Link to="/">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

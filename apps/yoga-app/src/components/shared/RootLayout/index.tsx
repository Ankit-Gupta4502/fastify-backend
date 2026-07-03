import { type ReactNode } from "react";
import { RootHeader } from "./RootHeader";
import { RootFooter } from "./RootFooter";

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-primary/15 via-accent/10 to-transparent blur-3xl" />
      <RootHeader />
      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <RootFooter />
    </div>
  );
}

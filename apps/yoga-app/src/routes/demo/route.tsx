import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo")({
  beforeLoad: ({ context }) => {
    if (!context.user) {
      // Preserve intent so post-login redirect works
      if (typeof window !== "undefined") {
        localStorage.setItem("demoClassIntent", "true");
      }
      throw redirect({ to: "/login" });
    }
  },
  component: () => <Outlet />,
});

import { useEffect } from "react";
import { createFileRoute, Outlet, redirect, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@yoga-app/shared";
import { InstructorSidebar } from "./_components/instructor-sidebar";
import { InstructorHeader } from "./_components/instructor-header";

export const Route = createFileRoute("/instructor")({
  component: InstructorLayout,
  beforeLoad: (ctx) => {
    if (ctx.location.pathname === "/instructor") {
      throw redirect({ to: "/instructor/dashboard" });
    }
  },
});

function InstructorLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== USER_ROLES.INSTRUCTOR) {
      navigate({ to: "/login", search: { redirect: location.href } });
    }
  }, [isLoading, isAuthenticated, user, navigate, location.href]);

  if (isLoading || !isAuthenticated || user?.role !== USER_ROLES.INSTRUCTOR) return null;

  return (
    <div className="flex h-screen overflow-hidden animate-in fade-in duration-300">
      <InstructorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <InstructorHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

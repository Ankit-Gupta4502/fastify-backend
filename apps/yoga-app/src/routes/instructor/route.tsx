import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@yoga-app/shared";

export const Route = createFileRoute("/instructor")({
  component: InstructorLayout,
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <Outlet />
    </div>
  );
}

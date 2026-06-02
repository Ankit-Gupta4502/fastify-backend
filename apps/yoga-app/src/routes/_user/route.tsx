import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@yoga-app/shared";
import { UserNav } from "./-components/user-nav";

export const Route = createFileRoute("/_user")({
  component: UserLayout,
});

function UserLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== USER_ROLES.USER) {
      navigate({ to: "/login", search: { redirect: location.href } });
    }
  }, [isLoading, isAuthenticated, user, navigate, location.href]);

  if (isLoading || !isAuthenticated || user?.role !== USER_ROLES.USER) return null;

  return (
    <div className="flex h-screen overflow-hidden animate-in fade-in duration-300">
      <UserNav />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

import { useEffect } from "react";
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useLocation,
  redirect,
} from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@yoga-app/shared";
import { AdminNav } from "./-components/admin-nav";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  beforeLoad: (ctx) => {
    if (ctx.location.pathname == "/admin") {
      throw redirect({to:"/admin/users"});
    }
  },
});

function AdminLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== USER_ROLES.ADMIN) {
      navigate({ to: "/login", search: { redirect: location.href } });
    }
  }, [isLoading, isAuthenticated, user, navigate, location.href]);

  if (isLoading || !isAuthenticated || user?.role !== USER_ROLES.ADMIN)
    return null;

  return (
    <div className="flex h-screen overflow-hidden animate-in fade-in duration-300">
      <AdminNav />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

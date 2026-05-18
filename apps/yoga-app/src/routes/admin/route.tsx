import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@yoga-app/shared";
import { AdminNav } from "./_components/admin-nav";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    const state = useAuthStore.getState();
    if (!state.isAuthenticated || state.user?.role !== USER_ROLES.ADMIN) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
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

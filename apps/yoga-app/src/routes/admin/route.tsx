import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { USER_ROLES } from "@yoga-app/shared";
import { AdminNav } from "./-components/admin-nav";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context, location }) => {
    if (!context.user || context.user.role !== USER_ROLES.ADMIN) {
      throw redirect({ to: "/login" });
    }
    if (location.pathname === "/admin") {
      throw redirect({ to: "/admin/users" });
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

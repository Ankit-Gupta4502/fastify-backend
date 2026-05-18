import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@yoga-app/shared";
import { UserNav } from "./_components/user-nav";

export const Route = createFileRoute("/_user")({
  beforeLoad: ({ location }) => {
    const state = useAuthStore.getState();
    if (!state.isAuthenticated || state.user?.role !== USER_ROLES.USER) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: UserLayout,
});

function UserLayout() {
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

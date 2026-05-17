import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@yoga-app/shared";

export const Route = createFileRoute("/_user")({
  beforeLoad: ({ location }) => {
    // We access the store state directly for the check
    const state = useAuthStore.getState();
    
    if (!state.isAuthenticated || state.user?.role !== USER_ROLES.USER) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: UserLayout,
});

function UserLayout() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Outlet />
    </div>
  );
}

import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth.store";
import { USER_ROLES } from "@yoga-app/shared";

export const Route = createFileRoute("/instructor")({
  beforeLoad: ({ location }) => {
    const state = useAuthStore.getState();
    if (!state.isAuthenticated || state.user?.role !== USER_ROLES.INSTRUCTOR) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: InstructorLayout,
});

function InstructorLayout() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Outlet />
    </div>
  );
}

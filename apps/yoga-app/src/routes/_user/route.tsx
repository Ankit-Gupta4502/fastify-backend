import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { USER_ROLES } from "@yoga-app/shared";
import { UserNav } from "./-components/UserNav";

export const Route = createFileRoute("/_user")({
  beforeLoad: ({ context }) => {
    if (!context.user || context.user.role !== USER_ROLES.USER) {
      throw redirect({ to: "/login" });
    }
    if (!context.user.emailVerified) {
      throw redirect({ to: "/verify-email" });
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

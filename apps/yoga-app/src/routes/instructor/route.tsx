import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { USER_ROLES } from "@yoga-app/shared";
import { InstructorSidebar } from "./-components/instructor-sidebar";
import { InstructorHeader } from "./-components/instructor-header";

export const Route = createFileRoute("/instructor")({
  beforeLoad: ({ context, location }) => {
    if (!context.user || context.user.role !== USER_ROLES.INSTRUCTOR) {
      throw redirect({ to: "/login" });
    }
    if (location.pathname === "/instructor") {
      throw redirect({ to: "/instructor/dashboard" });
    }
  },
  component: InstructorLayout,
});

function InstructorLayout() {
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

import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { fetchMyOrganizationsFn } from "@/features/organization/services/server-organizations.service";
import { OrgNav } from "@/features/organization/components/org-nav";

export const Route = createFileRoute("/org")({
  beforeLoad: async ({ context, location }) => {
    if (!context.user) throw redirect({ to: "/login" });

    const organizations = await fetchMyOrganizationsFn();
    const adminOrg = organizations.find((org) => org.role === "admin");
    if (!adminOrg) throw redirect({ to: "/" });

    if (location.pathname === "/org") {
      throw redirect({ to: "/org/members" });
    }

    return { organizationId: adminOrg.organizationId, organizationName: adminOrg.name };
  },
  component: OrgLayout,
});

function OrgLayout() {
  const { organizationName } = Route.useRouteContext();

  return (
    <div className="flex h-screen overflow-hidden animate-in fade-in duration-300">
      <OrgNav organizationName={organizationName} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

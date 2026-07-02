import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLoginForm } from "./-AdminLoginForm";
import { useAdminLogin } from "./-use-admin-login";

export const Route = createFileRoute("/admin-login/")({
  beforeLoad: ({ context }) => {
    if (context.user) throw redirect({ to: "/" });
  },
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { form, error, login, onSubmit } = useAdminLogin();

  return (
    <AdminLoginForm
      form={form}
      error={error}
      isPending={login.isPending}
      onSubmit={onSubmit}
    />
  );
}

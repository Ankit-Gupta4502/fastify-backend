import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminLoginForm } from "@/features/auth/components/admin-login-form";
import { useAdminLogin } from "@/features/auth/hooks/use-admin-login";

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

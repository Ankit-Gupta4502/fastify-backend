import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginForm } from "./_admin-login/AdminLoginForm";
import { useAdminLogin } from "./_admin-login/use-admin-login";

export const Route = createFileRoute("/admin-login")({
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

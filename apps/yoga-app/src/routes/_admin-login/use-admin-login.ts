import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { USER_ROLES } from "@yoga-app/shared";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/http";
import { useAuthStore } from "@/store/auth.store";

export const adminLoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginForm = z.infer<typeof adminLoginSchema>;

export function useAdminLogin() {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role === USER_ROLES.ADMIN) {
      navigate({ to: "/admin" });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: AdminLoginForm) {
    setError(null);
    try {
      await login.mutateAsync({
        email: values.email,
        password: values.password,
        role: USER_ROLES.ADMIN,
      });
      navigate({ to: "/admin" });
    } catch (err) {
      setError(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Login failed",
      );
    }
  }

  return { form, error, login, onSubmit };
}

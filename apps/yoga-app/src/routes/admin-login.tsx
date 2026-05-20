import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Mail, MoveRight, Shield } from "lucide-react";
import { USER_ROLES } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/http";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
});

const adminLoginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

function AdminLoginPage() {
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

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
            <Shield className="size-5" />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-xs">
            Restricted — authorised personnel only
          </p>
        </div>

        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className={cn(
                    "text-xs",
                    form.formState.errors.email && "text-destructive",
                  )}
                >
                  Email address
                </Label>
                <div className="relative">
                  <Mail
                    className={cn(
                      "absolute left-3 top-2.5 size-4 transition-colors",
                      form.formState.errors.email
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    className={cn(
                      "pl-10 h-10",
                      form.formState.errors.email &&
                        "border-destructive focus-visible:ring-destructive/20",
                    )}
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-[10px] font-medium text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className={cn(
                    "text-xs",
                    form.formState.errors.password && "text-destructive",
                  )}
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className={cn(
                      "absolute left-3 top-2.5 size-4 transition-colors",
                      form.formState.errors.password
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={cn(
                      "pl-10 h-10",
                      form.formState.errors.password &&
                        "border-destructive focus-visible:ring-destructive/20",
                    )}
                    {...form.register("password")}
                  />
                </div>
                {form.formState.errors.password && (
                  <p className="text-[10px] font-medium text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium text-center animate-in fade-in zoom-in-95">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 rounded-xl text-sm bg-destructive hover:bg-destructive/90 shadow-lg shadow-destructive/20"
                disabled={login.isPending}
              >
                {login.isPending ? "Authenticating..." : "Sign In as Admin"}
                {!login.isPending && <MoveRight className="ml-2 size-4" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

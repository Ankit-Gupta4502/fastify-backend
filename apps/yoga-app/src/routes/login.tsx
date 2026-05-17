import { useState } from "react";
import { useForm } from "react-hook-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MoveRight, Sparkles, Mail, Lock, UserCircle } from "lucide-react";
import {
  USER_ROLES,
  PUBLIC_USER_ROLE_VALUES,
  type LoginBody,
  type RegisterBody,
} from "@yoga-app/shared";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginFormOptions, registerFormOptions } from "@/lib/validation/auth";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/http";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    const state = useAuthStore.getState();
    if (state.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { login, register: registerUserMutation, getGoogleUrl } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginBody>(loginFormOptions);
  const registerForm = useForm<RegisterBody>(registerFormOptions);

  const isSubmitting = login.isPending || registerUserMutation.isPending;

  async function onLoginSubmit(values: LoginBody) {
    setFeedback(null);
    try {
      await login.mutateAsync(values);
      navigate({ to: "/" });
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Login failed");
    }
  }

  async function onRegisterSubmit(values: RegisterBody) {
    setFeedback(null);
    try {
      await registerUserMutation.mutateAsync(values);
      setFeedback("Account created successfully! Redirecting...");
      setTimeout(() => navigate({ to: "/" }), 1500);
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Registration failed");
    }
  }

  function handleGoogleSignIn() {
    const callbackURL = typeof window !== "undefined" ? window.location.origin : "";
    window.location.assign(getGoogleUrl(callbackURL));
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-1">
          <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
            <Sparkles className="size-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Join our community"}
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            {mode === "login" 
              ? "Continue your journey to inner peace" 
              : "Start your structured path to wellness today"}
          </p>
        </div>

        <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => { setMode("login"); setFeedback(null); loginForm.reset(); }}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-all relative",
                mode === "login" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Login
              {mode === "login" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />}
            </button>
            <button
              onClick={() => { setMode("register"); setFeedback(null); registerForm.reset(); }}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-all relative",
                mode === "register" ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Register
              {mode === "register" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />}
            </button>
          </div>

          <CardContent className="pt-6">
            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className={cn("text-xs", loginForm.formState.errors.email && "text-destructive")}>
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className={cn(
                      "absolute left-3 top-2.5 size-4 transition-colors",
                      loginForm.formState.errors.email ? "text-destructive" : "text-muted-foreground"
                    )} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className={cn(
                        "pl-10 h-10",
                        loginForm.formState.errors.email && "border-destructive focus-visible:ring-destructive/20"
                      )}
                      {...loginForm.register("email")}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-[10px] font-medium text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className={cn("text-xs", loginForm.formState.errors.password && "text-destructive")}>
                      Password
                    </Label>
                    <button type="button" className="text-[10px] text-primary hover:underline">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className={cn(
                      "absolute left-3 top-2.5 size-4 transition-colors",
                      loginForm.formState.errors.password ? "text-destructive" : "text-muted-foreground"
                    )} />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className={cn(
                        "pl-10 h-10",
                        loginForm.formState.errors.password && "border-destructive focus-visible:ring-destructive/20"
                      )}
                      {...loginForm.register("password")}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-[10px] font-medium text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  <Label className={cn("text-xs", loginForm.formState.errors.role && "text-destructive")}>
                    Sign in as
                  </Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PUBLIC_USER_ROLE_VALUES.map((role) => (
                      <label
                        key={role}
                        className={cn(
                          "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-2 px-3 transition-all hover:bg-muted/50",
                          loginForm.watch("role") === role 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-transparent bg-secondary/50",
                          loginForm.formState.errors.role && "border-destructive/50"
                        )}
                      >
                        <input
                          type="radio"
                          value={role}
                          className="sr-only"
                          {...loginForm.register("role")}
                        />
                        <span className="text-xs font-medium">
                          {role === USER_ROLES.INSTRUCTOR ? "Instructor" : "Student"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="size-3.5 rounded border-muted bg-background text-primary focus:ring-primary/20"
                    {...loginForm.register("rememberMe")}
                  />
                  <Label htmlFor="rememberMe" className="text-[11px] font-normal text-muted-foreground cursor-pointer">
                    Keep me signed in
                  </Label>
                </div>

                <Button type="submit" className="w-full h-10 rounded-xl text-sm shadow-lg shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting ? "Authenticating..." : "Sign In"}
                  {!isSubmitting && <MoveRight className="ml-2 size-4" />}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className={cn("text-xs", registerForm.formState.errors.name && "text-destructive")}>
                    Full name
                  </Label>
                  <div className="relative">
                    <UserCircle className={cn(
                      "absolute left-3 top-2.5 size-4 transition-colors",
                      registerForm.formState.errors.name ? "text-destructive" : "text-muted-foreground"
                    )} />
                    <Input
                      id="reg-name"
                      placeholder="Aarav Mehta"
                      className={cn(
                        "pl-10 h-10",
                        registerForm.formState.errors.name && "border-destructive focus-visible:ring-destructive/20"
                      )}
                      {...registerForm.register("name")}
                    />
                  </div>
                  {registerForm.formState.errors.name && (
                    <p className="text-[10px] font-medium text-destructive">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className={cn("text-xs", registerForm.formState.errors.email && "text-destructive")}>
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className={cn(
                      "absolute left-3 top-2.5 size-4 transition-colors",
                      registerForm.formState.errors.email ? "text-destructive" : "text-muted-foreground"
                    )} />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="student@yoga.app"
                      className={cn(
                        "pl-10 h-10",
                        registerForm.formState.errors.email && "border-destructive focus-visible:ring-destructive/20"
                      )}
                      {...registerForm.register("email")}
                    />
                  </div>
                  {registerForm.formState.errors.email && (
                    <p className="text-[10px] font-medium text-destructive">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-password" className={cn("text-xs", registerForm.formState.errors.password && "text-destructive")}>
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className={cn(
                      "absolute left-3 top-2.5 size-4 transition-colors",
                      registerForm.formState.errors.password ? "text-destructive" : "text-muted-foreground"
                    )} />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="At least 8 characters"
                      className={cn(
                        "pl-10 h-10",
                        registerForm.formState.errors.password && "border-destructive focus-visible:ring-destructive/20"
                      )}
                      {...registerForm.register("password")}
                    />
                  </div>
                  {registerForm.formState.errors.password && (
                    <p className="text-[10px] font-medium text-destructive">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  <Label className={cn("text-xs", registerForm.formState.errors.role && "text-destructive")}>
                    Join Solara as
                  </Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PUBLIC_USER_ROLE_VALUES.map((role) => (
                      <label
                        key={role}
                        className={cn(
                          "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-2 px-3 transition-all hover:bg-muted/50",
                          registerForm.watch("role") === role 
                            ? "border-primary bg-primary/5 text-primary" 
                            : "border-transparent bg-secondary/50",
                          registerForm.formState.errors.role && "border-destructive/50"
                        )}
                      >
                        <input
                          type="radio"
                          value={role}
                          className="sr-only"
                          {...registerForm.register("role")}
                        />
                        <span className="text-xs font-medium">
                          {role === USER_ROLES.INSTRUCTOR ? "Instructor" : "Student"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full h-10 rounded-xl text-sm shadow-lg shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting ? "Creating account..." : "Create Account"}
                  {!isSubmitting && <MoveRight className="ml-2 size-4" />}
                </Button>
              </form>
            )}

            {feedback && (
              <div className={cn(
                "mt-4 p-2.5 rounded-lg text-center text-xs font-medium animate-in fade-in zoom-in-95",
                feedback.includes("success") ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              )}>
                {feedback}
              </div>
            )}

            <div className="relative py-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-3 text-muted-foreground font-semibold tracking-wider">
                  Social login
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-xl border-muted hover:bg-secondary/50 text-sm"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
            >
              <svg className="mr-2 size-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground px-6 leading-relaxed">
          By continuing, you agree to Solara&apos;s{" "}
          <Link to="/" className="underline hover:text-primary">Terms</Link> and{" "}
          <Link to="/" className="underline hover:text-primary">Privacy</Link>.
        </p>
      </div>
    </div>
  );
}

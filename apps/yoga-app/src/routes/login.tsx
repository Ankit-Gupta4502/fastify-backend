import { useState, useEffect } from "react";
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
import { StarDoodle, CircleDoodle, WaveDoodle, PlusDoodle } from "@/components/shared/doodles";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { login, register: registerUserMutation, getGoogleUrl } = useAuth();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate({ to: "/" });
  }, [isLoading, isAuthenticated, navigate]);

  const loginForm    = useForm<LoginBody>(loginFormOptions);
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
      setFeedback("Account created! Redirecting…");
      setTimeout(() => navigate({ to: "/" }), 1500);
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Registration failed");
    }
  }

  function handleGoogleSignIn() {
    const callbackURL = typeof window !== "undefined" ? window.location.origin : "";
    window.location.assign(getGoogleUrl(callbackURL));
  }

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setFeedback(null);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="relative flex min-h-[88vh] items-center justify-center px-4 py-10 overflow-hidden">

      {/* ── Ambient background ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[600px] bg-primary/6 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 right-0 size-[350px] bg-accent/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 size-[250px] bg-primary/4 blur-[80px] rounded-full" />
      </div>

      {/* ── Floating doodle decorations ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Top-left cluster */}
        <CircleDoodle className="absolute -top-10 -left-10 size-52 text-primary/7 animate-doodle-spin-slow" />
        <StarDoodle    className="absolute top-16 left-[8%] size-5 text-primary/20 animate-doodle-float" />
        <PlusDoodle    className="absolute top-32 left-[14%] size-4 text-primary/15 animate-doodle-float-alt" style={{ animationDelay: "0.8s" }} />

        {/* Top-right */}
        <StarDoodle    className="absolute top-10 right-[12%] size-4 text-accent/25 animate-doodle-float-alt" style={{ animationDelay: "1.2s" }} />
        <WaveDoodle    className="absolute top-20 right-[6%] w-20 text-primary/10 animate-doodle-float" style={{ animationDelay: "2s" }} />
        <CircleDoodle  className="absolute -top-8 right-[4%] size-36 text-accent/6 animate-doodle-spin-rev" />

        {/* Bottom-left */}
        <StarDoodle    className="absolute bottom-20 left-[6%] size-3 text-primary/18 animate-doodle-float" style={{ animationDelay: "1.5s" }} />
        <WaveDoodle    className="absolute bottom-32 left-[10%] w-16 text-primary/8 animate-doodle-float-alt" style={{ animationDelay: "0.5s" }} />

        {/* Bottom-right */}
        <CircleDoodle  className="absolute -bottom-12 -right-12 size-56 text-primary/6 animate-doodle-spin-slow" style={{ animationDirection: "reverse" }} />
        <StarDoodle    className="absolute bottom-24 right-[10%] size-4 text-accent/20 animate-doodle-float-alt" style={{ animationDelay: "2.2s" }} />
        <PlusDoodle    className="absolute bottom-16 right-[18%] size-5 text-primary/12 animate-doodle-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* ── Form card ── */}
      <div className="relative w-full max-w-md space-y-6 animate-doodle-fade-up">

        {/* Brand mark */}
        <div className="text-center space-y-2">
          <div className="relative mx-auto w-fit">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shadow-lg shadow-primary/10 mx-auto">
              <Sparkles className="size-5" />
            </div>
            {/* Ping ring */}
            <span className="absolute inset-0 rounded-2xl border border-primary/20 animate-ping opacity-40" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
            {mode === "login" ? "Welcome back" : "Join the sangha"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "login"
              ? "Continue your journey to inner peace"
              : "Start your structured path to wellness today"}
          </p>
        </div>

        {/* Card */}
        <Card className="border pt-0 border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">

          {/* Tab strip */}
          <div className="flex border-b border-border/50">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 py-3.5 text-sm font-semibold capitalize transition-all duration-200 relative",
                  mode === m
                    ? "text-primary bg-primary/4"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                )}
              >
                {m === "login" ? "Sign in" : "Register"}
                {mode === m && (
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          <CardContent className="pt-4 pb-7 px-7">
            {mode === "login" ? (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                {/* Email */}
                <Field label="Email address" error={loginForm.formState.errors.email?.message}>
                  <div className="relative">
                    <Mail className={cn("absolute left-3 top-2.5 size-4 transition-colors", loginForm.formState.errors.email ? "text-destructive" : "text-muted-foreground")} />
                    <Input id="email" type="email" placeholder="name@example.com"
                      className={cn("pl-10 h-10", loginForm.formState.errors.email && "border-destructive focus-visible:ring-destructive/20")}
                      {...loginForm.register("email")} />
                  </div>
                </Field>

                {/* Password */}
                <Field
                  label="Password"
                  error={loginForm.formState.errors.password?.message}
                  labelRight={<button type="button" className="text-[10px] text-primary hover:underline">Forgot?</button>}
                >
                  <div className="relative">
                    <Lock className={cn("absolute left-3 top-2.5 size-4 transition-colors", loginForm.formState.errors.password ? "text-destructive" : "text-muted-foreground")} />
                    <Input id="password" type="password" placeholder="••••••••"
                      className={cn("pl-10 h-10", loginForm.formState.errors.password && "border-destructive focus-visible:ring-destructive/20")}
                      {...loginForm.register("password")} />
                  </div>
                </Field>

                {/* Role */}
                <RoleSelector form={loginForm} label="Sign in as" />

                {/* Remember */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="rememberMe"
                    className="size-3.5 rounded border-muted bg-background text-primary focus:ring-primary/20"
                    {...loginForm.register("rememberMe")} />
                  <Label htmlFor="rememberMe" className="text-[11px] font-normal text-muted-foreground cursor-pointer">
                    Keep me signed in
                  </Label>
                </div>

                <SubmitButton loading={isSubmitting} label="Sign In" loadingLabel="Authenticating…" />
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                {/* Name */}
                <Field label="Full name" error={registerForm.formState.errors.name?.message}>
                  <div className="relative">
                    <UserCircle className={cn("absolute left-3 top-2.5 size-4 transition-colors", registerForm.formState.errors.name ? "text-destructive" : "text-muted-foreground")} />
                    <Input id="reg-name" placeholder="Aarav Mehta"
                      className={cn("pl-10 h-10", registerForm.formState.errors.name && "border-destructive focus-visible:ring-destructive/20")}
                      {...registerForm.register("name")} />
                  </div>
                </Field>

                {/* Email */}
                <Field label="Email address" error={registerForm.formState.errors.email?.message}>
                  <div className="relative">
                    <Mail className={cn("absolute left-3 top-2.5 size-4 transition-colors", registerForm.formState.errors.email ? "text-destructive" : "text-muted-foreground")} />
                    <Input id="reg-email" type="email" placeholder="you@example.com"
                      className={cn("pl-10 h-10", registerForm.formState.errors.email && "border-destructive focus-visible:ring-destructive/20")}
                      {...registerForm.register("email")} />
                  </div>
                </Field>

                {/* Password */}
                <Field label="Password" error={registerForm.formState.errors.password?.message}>
                  <div className="relative">
                    <Lock className={cn("absolute left-3 top-2.5 size-4 transition-colors", registerForm.formState.errors.password ? "text-destructive" : "text-muted-foreground")} />
                    <Input id="reg-password" type="password" placeholder="At least 8 characters"
                      className={cn("pl-10 h-10", registerForm.formState.errors.password && "border-destructive focus-visible:ring-destructive/20")}
                      {...registerForm.register("password")} />
                  </div>
                </Field>

                {/* Role */}
                <RoleSelector form={registerForm} label="Join Solara as" />

                <SubmitButton loading={isSubmitting} label="Create Account" loadingLabel="Creating account…" />
              </form>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={cn(
                "mt-4 px-4 py-3 rounded-xl text-center text-xs font-medium",
                feedback.includes("success") || feedback.includes("created")
                  ? "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-destructive/8 text-destructive border border-destructive/20",
              )}>
                {feedback}
              </div>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-3 text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            {/* Google */}
            <Button type="button" variant="outline"
              className="w-full h-10 rounded-xl border-border/60 hover:bg-muted/40 text-sm font-medium gap-2.5"
              onClick={handleGoogleSignIn} disabled={isSubmitting}
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground leading-relaxed px-4">
          By continuing, you agree to Solara's{" "}
          <Link to="/" className="underline hover:text-primary transition-colors">Terms</Link> and{" "}
          <Link to="/" className="underline hover:text-primary transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

// ── Small reusable helpers ────────────────────────────────────────────────────

function Field({
  label, error, labelRight, children,
}: {
  label: string;
  error?: string;
  labelRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className={cn("text-xs font-medium", error && "text-destructive")}>{label}</Label>
        {labelRight}
      </div>
      {children}
      {error && <p className="text-[10px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

function RoleSelector({ form, label }: { form: ReturnType<typeof useForm<any>>; label: string }) {
  const selected = form.watch("role");
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-2.5">
        {PUBLIC_USER_ROLE_VALUES.map((role: string) => (
          <label
            key={role}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 py-2.5 px-3 transition-all duration-200",
              selected === role
                ? "border-primary bg-primary/8 text-primary shadow-sm shadow-primary/10"
                : "border-border/50 bg-muted/30 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            <input type="radio" value={role} className="sr-only" {...form.register("role")} />
            <span className="text-xs font-semibold">
              {role === USER_ROLES.INSTRUCTOR ? "Instructor" : "Student"}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SubmitButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <div className="relative group pt-1">
      <div className="doodle-glow-ring" />
      <Button type="submit"
        className="relative w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all duration-300"
        disabled={loading}
      >
        {loading ? loadingLabel : label}
        {!loading && <MoveRight className="ml-2 size-4" />}
      </Button>
    </div>
  );
}

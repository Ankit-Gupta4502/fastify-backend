import { useForm } from "react-hook-form";
import { MoveRight, Mail, Lock, UserCircle, ArrowLeft, Info } from "lucide-react";
import {
  type LoginBody,
  type RegisterBody,
  type ForgotPasswordBody,
} from "@yoga-app/shared";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { type LoginMode } from "../-hooks/use-login";

interface LoginCardProps {
  mode: LoginMode;
  feedback: string | null;
  loginForm: ReturnType<typeof useForm<LoginBody>>;
  registerForm: ReturnType<typeof useForm<RegisterBody>>;
  forgotForm: ReturnType<typeof useForm<ForgotPasswordBody>>;
  isSubmitting: boolean;
  isForgotPending: boolean;
  isGooglePending: boolean;
  onLoginSubmit: (values: LoginBody) => Promise<void>;
  onRegisterSubmit: (values: RegisterBody) => Promise<void>;
  onForgotSubmit: (values: ForgotPasswordBody) => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
  switchMode: (next: LoginMode) => void;
}

export function LoginCard({
  mode,
  feedback,
  loginForm,
  registerForm,
  forgotForm,
  isSubmitting,
  isForgotPending,
  isGooglePending,
  onLoginSubmit,
  onRegisterSubmit,
  onForgotSubmit,
  handleGoogleSignIn,
  switchMode,
}: LoginCardProps) {
  const isForgot = mode === "forgot";

  return (
    <Card className="border pt-0 border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">

      {/* Tab strip — hidden in forgot mode */}
      {!isForgot && (
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
      )}

      {/* Forgot mode header */}
      {isForgot && (
        <div className="flex items-center gap-2 px-7 pt-5 pb-0">
          <button
            onClick={() => switchMode("login")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to sign in
          </button>
        </div>
      )}

      <CardContent className="pt-4 pb-7 px-7">
        {mode === "login" && (
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
              labelRight={
                <button
                  type="button"
                  className="text-[10px] text-primary hover:underline"
                  onClick={() => switchMode("forgot")}
                >
                  Forgot?
                </button>
              }
            >
              <div className="relative">
                <Lock className={cn("absolute left-3 top-2.5 size-4 transition-colors", loginForm.formState.errors.password ? "text-destructive" : "text-muted-foreground")} />
                <Input id="password" type="password" placeholder="••••••••"
                  className={cn("pl-10 h-10", loginForm.formState.errors.password && "border-destructive focus-visible:ring-destructive/20")}
                  {...loginForm.register("password")} />
              </div>
            </Field>

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
        )}

        {mode === "register" && (
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

            <SubmitButton loading={isSubmitting} label="Create Account" loadingLabel="Creating account…" />
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-4">
            <div className="space-y-1 pb-1">
              <p className="text-sm font-semibold text-foreground">Reset your password</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter your email and we'll send you a link to choose a new password.
              </p>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/8 px-3.5 py-3">
              <Info className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Signed in with Google or another platform? Reset your password from that service's account settings instead.
              </p>
            </div>

            <Field label="Email address" error={forgotForm.formState.errors.email?.message}>
              <div className="relative">
                <Mail className={cn("absolute left-3 top-2.5 size-4 transition-colors", forgotForm.formState.errors.email ? "text-destructive" : "text-muted-foreground")} />
                <Input id="forgot-email" type="email" placeholder="name@example.com"
                  className={cn("pl-10 h-10", forgotForm.formState.errors.email && "border-destructive focus-visible:ring-destructive/20")}
                  {...forgotForm.register("email")} />
              </div>
            </Field>

            <SubmitButton loading={isForgotPending} label="Send Reset Link" loadingLabel="Sending…" />
          </form>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={cn(
            "mt-4 px-4 py-3 rounded-xl text-center text-xs font-medium",
            feedback.startsWith("success:")
              ? "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : feedback.includes("success") || feedback.includes("created")
                ? "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-destructive/8 text-destructive border border-destructive/20",
          )}>
            {feedback.startsWith("success:") ? feedback.slice(8) : feedback}
          </div>
        )}

        {/* Divider + Google — hidden in forgot mode */}
        {!isForgot && (
          <>
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

            <Button type="button" variant="outline"
              className="w-full h-10 rounded-xl border-border/60 hover:bg-muted/40 hover:text-black text-sm font-medium gap-2.5"
              onClick={handleGoogleSignIn} disabled={isSubmitting || isGooglePending}
            >
              <svg className={cn("size-4", isGooglePending && "animate-spin opacity-60")} viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isGooglePending ? "Redirecting to Google…" : "Sign in with Google"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
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

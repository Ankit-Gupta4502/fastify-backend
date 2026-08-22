import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { type LoginBody, type RegisterBody, type ForgotPasswordBody } from "@yoga-app/shared";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { type LoginMode } from "@/features/auth/hooks/use-login";
import { LoginForm } from "@/features/auth/components/login/login-form";
import { OrgInviteBanner } from "@/features/auth/components/login/org-invite-banner";
import { RegisterForm } from "@/features/auth/components/login/register-form";
import { ForgotPasswordForm } from "@/features/auth/components/login/forgot-password-form";

interface LoginCardProps {
  mode: LoginMode;
  feedback: string | null;
  loginForm: ReturnType<typeof useForm<LoginBody>>;
  registerForm: ReturnType<typeof useForm<RegisterBody>>;
  forgotForm: ReturnType<typeof useForm<ForgotPasswordBody>>;
  isSubmitting: boolean;
  isForgotPending: boolean;
  isGooglePending: boolean;
  orgInviteToken?: string;
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
  orgInviteToken,
  onLoginSubmit,
  onRegisterSubmit,
  onForgotSubmit,
  handleGoogleSignIn,
  switchMode,
}: LoginCardProps) {
  const isForgot = mode === "forgot";

  return (
    <Card className="border pt-0 border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">

      {/* ── Tab strip (sign in / register) ── */}
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

      {/* ── Forgot mode back link ── */}
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

        {/* ── Register mode: invite banner (individual-vs-company is asked post-signup, in /onboarding) ── */}
        {mode === "register" && orgInviteToken && <OrgInviteBanner token={orgInviteToken} />}

        {/* ── Active form ── */}
        {mode === "login" && (
          <LoginForm
            form={loginForm}
            isSubmitting={isSubmitting}
            onSubmit={onLoginSubmit}
            switchMode={switchMode}
          />
        )}
        {mode === "register" && (
          <RegisterForm
            form={registerForm}
            isSubmitting={isSubmitting}
            onSubmit={onRegisterSubmit}
          />
        )}
        {mode === "forgot" && (
          <ForgotPasswordForm
            form={forgotForm}
            isPending={isForgotPending}
            onSubmit={onForgotSubmit}
          />
        )}

        {/* ── Feedback banner ── */}
        {feedback && (
          <div className={cn(
            "mt-4 px-4 py-3 rounded-xl text-center text-xs font-medium",
            feedback.startsWith("success:") || feedback.includes("success") || feedback.includes("created")
              ? "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-destructive/8 text-destructive border border-destructive/20",
          )}>
            {feedback.startsWith("success:") ? feedback.slice(8) : feedback}
          </div>
        )}

        {/* ── Divider + Google sign-in ── */}
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

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-xl border-border/60 hover:bg-muted/40 hover:text-black text-sm font-medium gap-2.5"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting || isGooglePending}
            >
              <GoogleIcon spinning={isGooglePending} />
              {isGooglePending ? "Redirecting to Google…" : "Sign in with Google"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function GoogleIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg className={cn("size-4", spinning && "animate-spin opacity-60")} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

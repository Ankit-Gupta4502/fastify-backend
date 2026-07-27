import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { z } from "zod";

import { StarDoodle, CircleDoodle, WaveDoodle, PlusDoodle } from "@/shared/components/misc/doodles";
import { useLogin } from "@/features/auth/hooks/use-login";
import { LoginCard } from "@/features/auth/components/login/login-card";

const searchSchema = z.object({
  redirect: z.string().optional(),
  ref: z.string().optional(),
});

export const Route = createFileRoute("/login/")({
  validateSearch: searchSchema,
  beforeLoad: ({ context, search }) => {
    if (context.user) throw redirect({ href: search.redirect || "/" });
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo, ref: referralCode } = Route.useSearch();
  const {
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
  } = useLogin(redirectTo, referralCode);

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
            {mode === "login" ? "Welcome back" : mode === "register" ? "Join the sangha" : "Forgot password?"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {mode === "login"
              ? "Continue your journey to inner peace"
              : mode === "register"
                ? "Start your structured path to wellness today"
                : "No worries — we'll send you a reset link"}
          </p>
        </div>

        <LoginCard
          mode={mode}
          feedback={feedback}
          loginForm={loginForm}
          registerForm={registerForm}
          forgotForm={forgotForm}
          isSubmitting={isSubmitting}
          isForgotPending={isForgotPending}
          isGooglePending={isGooglePending}
          onLoginSubmit={onLoginSubmit}
          onRegisterSubmit={onRegisterSubmit}
          onForgotSubmit={onForgotSubmit}
          handleGoogleSignIn={handleGoogleSignIn}
          switchMode={switchMode}
        />

        <p className="text-center text-[10px] text-muted-foreground leading-relaxed px-4">
          By continuing, you agree to Book Your Yoga Teacher's{" "}
          <Link to="/" className="underline hover:text-primary transition-colors">Terms</Link> and{" "}
          <Link to="/" className="underline hover:text-primary transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

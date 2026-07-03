import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Info } from "lucide-react";
import { z } from "zod";

import { StarDoodle, CircleDoodle, WaveDoodle, PlusDoodle } from "@/components/shared/Doodles";
import { authApi } from "@/api";
import { ApiRequestError } from "@/lib/http";
import { type ResetPasswordClientBody } from "@/lib/validation/auth";
import { ResetPasswordCard } from "./-components/ResetPasswordCard";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/reset-password/")({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(values: ResetPasswordClientBody) {
    if (!token) return;
    setFeedback(null);
    setIsPending(true);
    try {
      await authApi.resetPassword({ token: values.token || token, newPassword: values.newPassword });
      setFeedback("success:Your password has been updated. Redirecting to sign in…");
      setTimeout(() => navigate({ to: "/login" }), 2500);
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Reset failed. The link may have expired.");
    } finally {
      setIsPending(false);
    }
  }

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
        <CircleDoodle className="absolute -top-10 -left-10 size-52 text-primary/7 animate-doodle-spin-slow" />
        <StarDoodle    className="absolute top-16 left-[8%] size-5 text-primary/20 animate-doodle-float" />
        <PlusDoodle    className="absolute top-32 left-[14%] size-4 text-primary/15 animate-doodle-float-alt" style={{ animationDelay: "0.8s" }} />
        <StarDoodle    className="absolute top-10 right-[12%] size-4 text-accent/25 animate-doodle-float-alt" style={{ animationDelay: "1.2s" }} />
        <WaveDoodle    className="absolute top-20 right-[6%] w-20 text-primary/10 animate-doodle-float" style={{ animationDelay: "2s" }} />
        <CircleDoodle  className="absolute -bottom-12 -right-12 size-56 text-primary/6 animate-doodle-spin-slow" style={{ animationDirection: "reverse" }} />
      </div>

      <div className="relative w-full max-w-md space-y-6 animate-doodle-fade-up">

        {/* Brand mark */}
        <div className="text-center space-y-2">
          <div className="relative mx-auto w-fit">
            <div className="size-12 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary shadow-lg shadow-primary/10 mx-auto">
              <Sparkles className="size-5" />
            </div>
            <span className="absolute inset-0 rounded-2xl border border-primary/20 animate-ping opacity-40" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">Set new password</h1>
          <p className="text-muted-foreground text-sm">Choose a strong password for your account.</p>
        </div>

        {!token ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/8 px-6 py-5 text-center space-y-3">
            <p className="text-sm font-medium text-destructive">Invalid or missing reset link.</p>
            <p className="text-xs text-muted-foreground">
              Please{" "}
              <Link to="/login" className="text-primary underline hover:no-underline">
                request a new one
              </Link>{" "}
              from the sign-in page.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3">
              <Info className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                If you originally signed in with Google or another platform, please reset your password from that service's account settings — not here.
              </p>
            </div>
            <ResetPasswordCard
              token={token}
              onSubmit={handleSubmit}
              isPending={isPending}
              feedback={feedback}
            />
          </>
        )}

        <p className="text-center text-[10px] text-muted-foreground">
          Remembered your password?{" "}
          <Link to="/login" className="text-primary underline hover:no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

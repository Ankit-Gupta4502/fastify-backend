import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { z } from "zod";

import { StarDoodle, CircleDoodle, WaveDoodle, PlusDoodle } from "@/components/shared/Doodles";
import { authApi } from "@/api";
import { ApiRequestError } from "@/lib/http";
import { useAuthStore } from "@/store/auth.store";
import { VerifyEmailCard } from "./-components/VerifyEmailCard";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/verify-email/")({
  validateSearch: searchSchema,
  component: VerifyEmailPage,
});

type Status = "idle" | "verifying" | "success" | "error";

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [status, setStatus] = useState<Status>(token ? "verifying" : "idle");
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!token || ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const response = await authApi.verifyEmail(token);
        if (response.data?.user) setUser(response.data.user);
        setStatus("success");
        setTimeout(() => navigate({ to: "/", replace: true }), 2000);
      } catch (err) {
        setError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Verification failed. The link may have expired.");
        setStatus("error");
      }
    })();
  }, [token, navigate, setUser]);

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
          <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">Verify your email</h1>
          <p className="text-muted-foreground text-sm">One quick step before you can start booking sessions.</p>
        </div>

        <VerifyEmailCard status={status} error={error} user={user} />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, MailCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/api";
import { ApiRequestError } from "@/lib/http";
import { type AuthUser } from "@/store/auth.store";

const RESEND_COOLDOWN_SECONDS = 30;

interface VerifyEmailCardProps {
  status: "idle" | "verifying" | "success" | "error";
  error: string | null;
  user: AuthUser | null;
}

export function VerifyEmailCard({ status, error, user }: VerifyEmailCardProps) {
  const [resendState, setResendState] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!user?.email || cooldown > 0) return;
    setResendState("pending");
    setResendError(null);
    try {
      await authApi.resendVerificationEmail(user.email);
      setResendState("sent");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setResendError(err instanceof ApiRequestError || err instanceof Error ? err.message : "Something went wrong");
      setResendState("error");
    }
  }

  if (status === "verifying") {
    return (
      <Card className="border border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">
        <CardContent className="pt-8 pb-8 px-7 flex flex-col items-center gap-4 text-center">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="border border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">
        <CardContent className="pt-8 pb-8 px-7 flex flex-col items-center gap-4 text-center">
          <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="size-7 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Email verified!</p>
            <p className="text-xs text-muted-foreground">Redirecting you in…</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="border border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">
        <CardContent className="pt-8 pb-8 px-7 flex flex-col items-center gap-4 text-center">
          <div className="size-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <XCircle className="size-7 text-destructive" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Verification failed</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          {user?.email ? (
            <ResendButton
              resendState={resendState}
              resendError={resendError}
              cooldown={cooldown}
              onResend={handleResend}
            />
          ) : (
            <Link to="/login" className="text-xs text-primary underline hover:no-underline">
              Back to sign in
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  // status === "idle" — the "wall": authenticated but unverified, no token in the URL yet
  if (!user) {
    return (
      <Card className="border border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">
        <CardContent className="pt-8 pb-8 px-7 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Please sign in to resend your verification link.
          </p>
          <Link to="/login" className="text-xs text-primary underline hover:no-underline">
            Go to sign in
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">
      <CardContent className="pt-8 pb-8 px-7 flex flex-col items-center gap-4 text-center">
        <div className="size-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MailCheck className="size-7 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">Check your inbox</p>
          <p className="text-xs text-muted-foreground">
            We sent a verification link to <span className="font-medium text-foreground">{user.email}</span>.
            Click it to activate your account.
          </p>
        </div>
        <ResendButton
          resendState={resendState}
          resendError={resendError}
          cooldown={cooldown}
          onResend={handleResend}
        />
      </CardContent>
    </Card>
  );
}

function ResendButton({
  resendState,
  resendError,
  cooldown,
  onResend,
}: {
  resendState: "idle" | "pending" | "sent" | "error";
  resendError: string | null;
  cooldown: number;
  onResend: () => void;
}) {
  return (
    <div className="w-full space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 rounded-xl text-sm font-semibold"
        disabled={resendState === "pending" || cooldown > 0}
        onClick={onResend}
      >
        {resendState === "pending"
          ? "Sending…"
          : cooldown > 0
            ? `Resend link (${cooldown}s)`
            : "Resend verification link"}
      </Button>
      {resendState === "sent" && (
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Verification link sent — check your inbox.</p>
      )}
      {resendState === "error" && resendError && (
        <p className="text-[11px] text-destructive">{resendError}</p>
      )}
    </div>
  );
}

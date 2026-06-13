import { useForm } from "react-hook-form";
import { MoveRight, Lock, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { type ResetPasswordClientBody, resetPasswordFormOptions } from "@/lib/validation/auth";

interface ResetPasswordCardProps {
  token: string;
  onSubmit: (values: ResetPasswordClientBody) => Promise<void>;
  isPending: boolean;
  feedback: string | null;
}

export function ResetPasswordCard({ token, onSubmit, isPending, feedback }: ResetPasswordCardProps) {
  const form = useForm<ResetPasswordClientBody>({
    ...resetPasswordFormOptions,
    defaultValues: { token, newPassword: "", confirmPassword: "" },
  });

  const isSuccess = feedback?.startsWith("success:");

  if (isSuccess) {
    return (
      <Card className="border border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">
        <CardContent className="pt-8 pb-8 px-7 flex flex-col items-center gap-4 text-center">
          <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="size-7 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">Password updated!</p>
            <p className="text-xs text-muted-foreground">{feedback?.slice(8)}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border pt-0 border-border/50 shadow-2xl shadow-black/8 bg-card/90 backdrop-blur-xl overflow-hidden sketch-border-lg">
      <div className="border-b border-border/50 px-7 py-4">
        <p className="text-sm font-semibold text-foreground">Choose a new password</p>
        <p className="text-xs text-muted-foreground mt-0.5">Must be at least 8 characters.</p>
      </div>

      <CardContent className="pt-5 pb-7 px-7">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Field label="New password" error={form.formState.errors.newPassword?.message}>
            <div className="relative">
              <Lock className={cn("absolute left-3 top-2.5 size-4 transition-colors", form.formState.errors.newPassword ? "text-destructive" : "text-muted-foreground")} />
              <Input id="new-password" type="password" placeholder="••••••••"
                className={cn("pl-10 h-10", form.formState.errors.newPassword && "border-destructive focus-visible:ring-destructive/20")}
                {...form.register("newPassword")} />
            </div>
          </Field>

          <Field label="Confirm password" error={form.formState.errors.confirmPassword?.message}>
            <div className="relative">
              <Lock className={cn("absolute left-3 top-2.5 size-4 transition-colors", form.formState.errors.confirmPassword ? "text-destructive" : "text-muted-foreground")} />
              <Input id="confirm-password" type="password" placeholder="••••••••"
                className={cn("pl-10 h-10", form.formState.errors.confirmPassword && "border-destructive focus-visible:ring-destructive/20")}
                {...form.register("confirmPassword")} />
            </div>
          </Field>

          {feedback && !isSuccess && (
            <div className="px-4 py-3 rounded-xl text-center text-xs font-medium bg-destructive/8 text-destructive border border-destructive/20">
              {feedback}
            </div>
          )}

          <div className="relative group pt-1">
            <div className="doodle-glow-ring" />
            <Button type="submit"
              className="relative w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all duration-300"
              disabled={isPending}
            >
              {isPending ? "Updating…" : "Update Password"}
              {!isPending && <MoveRight className="ml-2 size-4" />}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={cn("block text-xs font-medium", error && "text-destructive")}>{label}</label>
      {children}
      {error && <p className="text-[10px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

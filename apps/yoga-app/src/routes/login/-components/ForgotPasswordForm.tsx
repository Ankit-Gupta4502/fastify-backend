import { useForm } from "react-hook-form";
import { Mail, Info } from "lucide-react";
import { type ForgotPasswordBody } from "@yoga-app/shared";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Field, SubmitButton } from "./FormUI";

interface ForgotPasswordFormProps {
  form: ReturnType<typeof useForm<ForgotPasswordBody>>;
  isPending: boolean;
  onSubmit: (values: ForgotPasswordBody) => Promise<void>;
}

export function ForgotPasswordForm({ form, isPending, onSubmit }: ForgotPasswordFormProps) {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

      <Field label="Email address" error={errors.email?.message}>
        <div className="relative">
          <Mail className={cn("absolute left-3 top-2.5 size-4 transition-colors", errors.email ? "text-destructive" : "text-muted-foreground")} />
          <Input
            id="forgot-email"
            type="email"
            placeholder="name@example.com"
            className={cn("pl-10 h-10", errors.email && "border-destructive focus-visible:ring-destructive/20")}
            {...register("email")}
          />
        </div>
      </Field>

      <SubmitButton loading={isPending} label="Send Reset Link" loadingLabel="Sending…" />
    </form>
  );
}

import { useForm } from "react-hook-form";
import { Mail, Lock } from "lucide-react";
import { type LoginBody } from "@yoga-app/shared";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Field, SubmitButton } from "./_form-ui";
import { type LoginMode } from "../-hooks/use-login";

interface LoginFormProps {
  form: ReturnType<typeof useForm<LoginBody>>;
  isSubmitting: boolean;
  onSubmit: (values: LoginBody) => Promise<void>;
  switchMode: (next: LoginMode) => void;
}

export function LoginForm({ form, isSubmitting, onSubmit, switchMode }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Email address" error={errors.email?.message}>
        <div className="relative">
          <Mail className={cn("absolute left-3 top-2.5 size-4 transition-colors", errors.email ? "text-destructive" : "text-muted-foreground")} />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className={cn("pl-10 h-10", errors.email && "border-destructive focus-visible:ring-destructive/20")}
            {...register("email")}
          />
        </div>
      </Field>

      <Field
        label="Password"
        error={errors.password?.message}
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
          <Lock className={cn("absolute left-3 top-2.5 size-4 transition-colors", errors.password ? "text-destructive" : "text-muted-foreground")} />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className={cn("pl-10 h-10", errors.password && "border-destructive focus-visible:ring-destructive/20")}
            {...register("password")}
          />
        </div>
      </Field>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="rememberMe"
          className="size-3.5 rounded border-muted bg-background text-primary focus:ring-primary/20"
          {...register("rememberMe")}
        />
        <Label htmlFor="rememberMe" className="text-[11px] font-normal text-muted-foreground cursor-pointer">
          Keep me signed in
        </Label>
      </div>

      <SubmitButton loading={isSubmitting} label="Sign In" loadingLabel="Authenticating…" />
    </form>
  );
}

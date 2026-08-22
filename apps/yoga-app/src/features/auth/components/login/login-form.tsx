import { useForm } from "react-hook-form";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { type LoginBody } from "@yoga-app/shared";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/shared/lib/utils";
import { Field, SubmitButton } from "@/shared/components/forms/form-ui";
import { type LoginMode } from "@/features/auth/hooks/use-login";

interface LoginFormProps {
  form: ReturnType<typeof useForm<LoginBody>>;
  isSubmitting: boolean;
  onSubmit: (values: LoginBody) => Promise<void>;
  switchMode: (next: LoginMode) => void;
}

export function LoginForm({ form, isSubmitting, onSubmit, switchMode }: LoginFormProps) {
  const { register, handleSubmit, formState: { errors } } = form;
  const [showPassword, setShowPassword] = useState(false);

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
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={cn("pl-10 pr-10 h-10", errors.password && "border-destructive focus-visible:ring-destructive/20")}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
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

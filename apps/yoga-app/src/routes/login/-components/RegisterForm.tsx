import { useForm } from "react-hook-form";
import { useState } from "react";
import { Mail, Lock, UserCircle, Eye, EyeOff } from "lucide-react";
import { type RegisterBody } from "@yoga-app/shared";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Field, SubmitButton } from "./_form-ui";

interface RegisterFormProps {
  form: ReturnType<typeof useForm<RegisterBody>>;
  isSubmitting: boolean;
  onSubmit: (values: RegisterBody) => Promise<void>;
}

export function RegisterForm({ form, isSubmitting, onSubmit }: RegisterFormProps) {
  const { register, handleSubmit, formState: { errors } } = form;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Full name" error={errors.name?.message}>
        <div className="relative">
          <UserCircle className={cn("absolute left-3 top-2.5 size-4 transition-colors", errors.name ? "text-destructive" : "text-muted-foreground")} />
          <Input
            id="reg-name"
            placeholder="Aarav Mehta"
            className={cn("pl-10 h-10", errors.name && "border-destructive focus-visible:ring-destructive/20")}
            {...register("name")}
          />
        </div>
      </Field>

      <Field label="Email address" error={errors.email?.message}>
        <div className="relative">
          <Mail className={cn("absolute left-3 top-2.5 size-4 transition-colors", errors.email ? "text-destructive" : "text-muted-foreground")} />
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            className={cn("pl-10 h-10", errors.email && "border-destructive focus-visible:ring-destructive/20")}
            {...register("email")}
          />
        </div>
      </Field>

      <Field label="Password" error={errors.password?.message}>
        <div className="relative">
          <Lock className={cn("absolute left-3 top-2.5 size-4 transition-colors", errors.password ? "text-destructive" : "text-muted-foreground")} />
          <Input
            id="reg-password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
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

      <SubmitButton loading={isSubmitting} label="Create Account" loadingLabel="Creating account…" />
    </form>
  );
}

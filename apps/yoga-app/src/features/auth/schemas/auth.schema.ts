import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginBodySchema,
  registerBodySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginBody,
  type RegisterBody,
  type ForgotPasswordBody,
} from "@yoga-app/shared";
import { z } from "zod";

export const registerFormOptions = {
  resolver: zodResolver(registerBodySchema),
  defaultValues: {
    name: "",
    email: "",
    password: "",
  } satisfies RegisterBody,
};

export const loginFormOptions = {
  resolver: zodResolver(loginBodySchema),
  defaultValues: {
    email: "",
    password: "",
    rememberMe: true,
  } satisfies LoginBody,
};

export const forgotPasswordFormOptions = {
  resolver: zodResolver(forgotPasswordSchema),
  defaultValues: { email: "" } satisfies ForgotPasswordBody,
};

const resetPasswordClientSchema = resetPasswordSchema.extend({
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ResetPasswordClientBody = z.infer<typeof resetPasswordClientSchema>;

export const resetPasswordFormOptions = {
  resolver: zodResolver(resetPasswordClientSchema),
  defaultValues: { token: "", newPassword: "", confirmPassword: "" } satisfies ResetPasswordClientBody,
};

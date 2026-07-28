import { z } from "zod";

// Public registration is always "user" — instructors are added by admins only
export const registerBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().trim().min(1).optional(),
});

export const loginBodySchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const socialCallbackQuerySchema = z.object({
  callbackURL: z.url().optional(),
  ref: z.string().trim().min(1).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const resendVerificationEmailSchema = z.object({
  email: z.email("Invalid email address"),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type SocialCallbackQuery = z.infer<typeof socialCallbackQuerySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
export type ResendVerificationEmailBody = z.infer<typeof resendVerificationEmailSchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailSchema>;

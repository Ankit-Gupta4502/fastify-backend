import { z } from "zod";
import { ORGANIZATION_SIZE_BANDS } from "./constants";

// Present on register/social-callback requests when the user chose "Sign up
// as a Company" instead of an individual account.
export const organizationSignupSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required").max(120),
  sizeBand: z.enum(ORGANIZATION_SIZE_BANDS),
});

// Public registration is always "user" — instructors are added by admins only
export const registerBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  referralCode: z.string().trim().min(1).optional(),
  organization: organizationSignupSchema.optional(),
  // Present when signing up via an organization invite link — mutually
  // exclusive with `organization` in practice (the UI never shows both).
  orgInviteToken: z.string().trim().min(1).optional(),
});

export const loginBodySchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const socialCallbackQuerySchema = z.object({
  callbackURL: z.url().optional(),
  ref: z.string().trim().min(1).optional(),
  // Sent alongside the Google redirect when "Sign up as a Company" was chosen
  // — carried across the OAuth round trip via a pending-org cookie since it
  // can't ride along as part of the callback response body.
  orgName: z.string().trim().min(1).max(120).optional(),
  orgSizeBand: z.enum(ORGANIZATION_SIZE_BANDS).optional(),
  // Same round-trip problem, for a pending invite acceptance instead.
  orgInviteToken: z.string().trim().min(1).optional(),
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

export type OrganizationSignupInput = z.infer<typeof organizationSignupSchema>;
export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type SocialCallbackQuery = z.infer<typeof socialCallbackQuerySchema>;
export type ForgotPasswordBody = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordBody = z.infer<typeof resetPasswordSchema>;
export type ResendVerificationEmailBody = z.infer<typeof resendVerificationEmailSchema>;
export type VerifyEmailBody = z.infer<typeof verifyEmailSchema>;

import { z } from "zod";

// Public registration is always "user" — instructors are added by admins only
export const registerBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginBodySchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

export const socialCallbackQuerySchema = z.object({
  callbackURL: z.url().optional(),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type SocialCallbackQuery = z.infer<typeof socialCallbackQuerySchema>;

import { z } from "zod";
import { validateWithZod } from "../utils";
import { FastifyReply, FastifyRequest } from "fastify";
export class UserValidationSchema {
  public async signInUserSchema(req: FastifyRequest, reply: FastifyReply) {
    const user = z.object({
      email: z.email({ error: "Email is invalid" }),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
          /[^A-Za-z0-9]/,
          "Password must contain at least one special character"
        ),
    });
    return validateWithZod(req, reply, { body: user });
  }

  public async signUpUserSchema(req: FastifyRequest, reply: FastifyReply) {
    const user = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.email({ error: "Email is invalid" }),
      phone: z.string().min(10, "Phone number must be at least 10 digits"),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
          /[^A-Za-z0-9]/,
          "Password must contain at least one special character"
        ),
    });
    return validateWithZod(req, reply, { body: user });
  }

  public async sendOtpSchema(req: FastifyRequest, reply: FastifyReply) {
    const verifyEmailSchema = z.object({
      email: z.email(),
    });
    return validateWithZod(req, reply, { body: verifyEmailSchema });
  }
}

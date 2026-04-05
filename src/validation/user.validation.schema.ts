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

export const userSwaggerSchemas = {
  signIn: {
    description: "Sign in with email and password",
    tags: ["User"] as string[],
    body: {
      type: "object" as const,
      required: ["email", "password"],
      properties: {
        email: { type: "string" as const, format: "email" },
        password: { type: "string" as const },
      },
    },
    response: {
      200: {
        description: "Successful login",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              name: { type: "string" as const },
              email: { type: "string" as const },
              phone: { type: "string" as const },
              createdAt: { type: "string" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
      422: {
        description: "Invalid credentials",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: { type: "null" as const },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  signUp: {
    description: "Register a new user account",
    tags: ["User"] as string[],
    body: {
      type: "object" as const,
      required: ["name", "email", "phone", "password", "otp"],
      properties: {
        name: { type: "string" as const },
        email: { type: "string" as const, format: "email" },
        phone: { type: "string" as const },
        password: { type: "string" as const, minLength: 6 },
        otp: { type: "string" as const, minLength: 4, maxLength: 4 },
      },
    },
    response: {
      200: {
        description: "Successful registration",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              name: { type: "string" as const },
              email: { type: "string" as const },
              phone: { type: "string" as const },
              createdAt: { type: "string" as const },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
      422: {
        description: "Validation error",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: { type: "null" as const },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  sendEmail: {
    description: "Send OTP to email for verification",
    tags: ["User"] as string[],
    body: {
      type: "object" as const,
      required: ["email"],
      properties: {
        email: { type: "string" as const, format: "email" },
      },
    },
    response: {
      200: {
        description: "OTP sent successfully",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              message: { type: "string" as const },
              otp: { type: "string" as const, description: "Only in development mode" },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
  getUserDetail: {
    description: "Get authenticated user details with connected accounts and services",
    tags: ["User"] as string[],
    security: [{ cookieAuth: [] }],
    response: {
      200: {
        description: "User details with connected accounts and services",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: {
            type: "object" as const,
            properties: {
              id: { type: "string" as const },
              name: { type: "string" as const },
              email: { type: "string" as const },
              phone: { type: "string" as const },
              createdAt: { type: "string" as const },
              accounts: {
                type: "array" as const,
                items: {
                  type: "object" as const,
                  properties: {
                    id: { type: "string" as const },
                    providerAccountId: { type: "string" as const },
                    username: { type: "string" as const },
                    displayName: { type: "string" as const },
                    service: {
                      type: "object" as const,
                      properties: {
                        id: { type: "string" as const },
                        displayName: { type: "string" as const },
                        authType: { type: "string" as const },
                        enabled: { type: "boolean" as const },
                      },
                    },
                  },
                },
              },
            },
          },
          error: { type: "string" as const, nullable: true },
        },
      },
      404: {
        description: "User not found",
        type: "object" as const,
        properties: {
          success: { type: "boolean" as const },
          message: { type: "string" as const },
          data: { type: "null" as const },
          error: { type: "string" as const, nullable: true },
        },
      },
    },
  },
};

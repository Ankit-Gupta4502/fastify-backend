import Fastify from "fastify";
import middleware from "@fastify/express";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { UserController } from "./controllers/users/user.controller";
import fastifyEnv from "@fastify/env";
import fastifyCors from "@fastify/cors";
import db from "./db";
import cookie from "@fastify/cookie";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import authPlugin from "./plugins/auth.plugin";
import { AuthController } from "./controllers/auth/auth.controller";
import { RoomsController } from "./controllers/rooms/rooms.controller";
import { InstructorsController } from "./controllers/instructors/instructors.controller";
import { HmsWebhookController } from "./controllers/webhooks/hms.webhook.controller";
import { RazorpayWebhookController } from "./controllers/webhooks/razorpay.webhook.controller";
import { PlansController } from "./controllers/plans/plans.controller";
import { PaymentsController } from "./controllers/payments/payments.controller";
import { errorResponse } from "./utils";
import { FastifyError } from "fastify";
import { getDatabaseDriver } from "./config/database";
import { backendEnvPath } from "./config/env";
import { DEFAULT_BACKEND_PORT, DEFAULT_FRONTEND_URL } from "@yoga-app/shared";
import {drizzle} from "./db"

export const fastify = Fastify({
  logger: true,
});

fastify.setErrorHandler((err: FastifyError, req, reply) => {
  req.log.error({ err }, "request error");

  const status =
    err.statusCode && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;

  const { payload } = errorResponse({
    message: status === 500 ? "Internal server error" : err.message,
    statusCode: status,
  });

  reply.code(status).send(payload);
});

const schema = {
  type: "object",
  required: ["PORT", "DATABASE_URL", "BETTER_AUTH_SECRET"],
  properties: {
    PORT: { type: "string", default: "8080" },
    DATABASE_URL: { type: "string" },
    BETTER_AUTH_SECRET: { type: "string" },
    BETTER_AUTH_URL: { type: "string" },
    FRONTEND_URL: { type: "string" },
    GOOGLE_CLIENT_ID: { type: "string" },
    GOOGLE_CLIENT_SECRET: { type: "string" },
    DATABASE_DRIVER: { type: "string" },
    HMS_APP_ACCESS_KEY: { type: "string" },
    HMS_APP_SECRET: { type: "string" },
    HMS_TEMPLATE_ID_GROUP: { type: "string" },
    HMS_TEMPLATE_ID_PRIVATE: { type: "string" },
    RAZORPAY_KEY_ID: { type: "string" },
    RAZORPAY_KEY_SECRET: { type: "string" },
    RAZORPAY_WEBHOOK_SECRET: { type: "string" },
  },
};

const start = async () => {
  try {
    await fastify.register(fastifyEnv, {
      schema,
      dotenv: {
        path: backendEnvPath,
      },
    });
    fastify.register(middleware);

    const frontendUrl =
      process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

    fastify.register(fastifyCors, {
      origin: frontendUrl,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
      credentials: true,
    });

    await fastify.register(db);    
    await fastify.register(cookie);
    await fastify.register(authPlugin);

    const isProd = process.env.NODE_ENV === "production";
    const prodUrl = process.env.PROD_BASE_URL || "https://api.example.com";
    const devUrl = `http://localhost:${process.env.PORT || DEFAULT_BACKEND_PORT}`;

    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: "Fastify Backend API",
          description:
            "API documentation. Auth routes: POST /auth/register, POST /auth/login, POST /auth/logout, GET /auth/session, GET /auth/google. OAuth callbacks: /api/auth/*.",
          version: "1.0.0",
        },
        servers: [
          {
            url: isProd ? prodUrl : devUrl,
            description: isProd ? "Production server" : "Development server",
          },
        ],
        components: {
          securitySchemes: {
            cookieAuth: {
              type: "apiKey",
              in: "cookie",
              name: "better-auth.session_token",
            },
          },
        },
      },
    });

    await fastify.register(fastifySwaggerUi, {
      routePrefix: "/docs",
      uiConfig: {
        docExpansion: "list",
        deepLinking: false,
      },
    });

    const driver = getDatabaseDriver();
    fastify.log.info(`Database driver: ${driver}`);

    new AuthController(fastify);

    const authMiddleware = new AuthMiddleware();
    new UserController(authMiddleware, fastify);
    new RoomsController(authMiddleware, fastify);
    new InstructorsController(authMiddleware, fastify);
    new HmsWebhookController(fastify);
    new RazorpayWebhookController(fastify);
    new PlansController(authMiddleware, fastify);
    new PaymentsController(authMiddleware, fastify);

    fastify.get("/health", async () => {
      return { status: "ok", timestamp: new Date().toISOString() };
    });
    await fastify.ready();
    const port = Number(process.env.PORT) || DEFAULT_BACKEND_PORT;
    await fastify.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

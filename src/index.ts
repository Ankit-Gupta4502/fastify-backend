import Fastify from "fastify";
import middleware from "@fastify/express";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { UserController } from "./users/user.controller";
import fastifyEnv from "@fastify/env";
import dotevn from "dotenv";
import fastifyCors from "@fastify/cors";
import db from "./db";
import cookie from "@fastify/cookie";
import { ServicesController } from "./users/services.controller";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import { errorResponse } from "./utils";
import { FastifyError } from "fastify";

export const fastify = Fastify({
  logger: true,
});

fastify.setErrorHandler((err:FastifyError, req, reply) => {
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
  required: ["PORT", "DATABASE_URL"],
  properties: {
    PORT: { type: "string", default: "8080" },
    DATABASE_URL: { type: "string" },
  },
};

const start = async () => {
  try {
    // load envs
    await fastify.register(fastifyEnv, { schema, dotenv: true });
    fastify.register(middleware);
    fastify.register(fastifyCors, {
      origin: "*",
      allowedHeaders: "*",
      credentials: true,
    });

    // register db
    await fastify.register(db);
    await fastify.register(cookie);

    // register swagger
    const isProd = process.env.NODE_ENV === "production";
    const prodUrl = process.env.PROD_BASE_URL || "https://api.example.com";
    const devUrl = `http://localhost:${process.env.PORT || 8080}`;

    await fastify.register(fastifySwagger, {
      openapi: {
        info: {
          title: "Fastify Backend API",
          description: "API documentation for Fastify Backend",
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
              name: "token",
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

    // register controllers and routes
    const authMiddleware = new AuthMiddleware();
    new UserController(authMiddleware, fastify);
    new ServicesController(authMiddleware, fastify);
    fastify.get("/health", async () => {
      return { status: "ok", timestamp: new Date().toISOString() };
    });
    await fastify.ready();
    const port = Number(process.env.PORT) || 8080;
    await fastify.listen({ port: port, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

import Fastify from "fastify";
import middleware from "@fastify/express";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { UserController } from "./users/user.controller";
import fastifyEnv from "@fastify/env";
import dotevn from "dotenv";
import fastifyCors from "@fastify/cors";
import db from "./db";
import cookie from "@fastify/cookie";

export const fastify = Fastify({
  logger: true,
});

fastify.setErrorHandler((err, req, reply) => {
  req.log.error({ err }, "request error");

  const status =
    err.statusCode && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;

  reply.code(status).send({
    message: status === 500 ? "Internal server error" : err.message,
  });
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

    // register controllers and routes
    const authMiddleware = new AuthMiddleware();
    new UserController(authMiddleware, fastify);

    await fastify.ready();
    await fastify.listen({ port: 8080 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

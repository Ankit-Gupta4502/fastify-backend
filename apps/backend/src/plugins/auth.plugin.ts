import fp from "fastify-plugin";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";

export default fp(async (fastify) => {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      try {
        const url = new URL(
          request.url,
          `${request.protocol}://${request.headers.host}`
        );
        const headers = fromNodeHeaders(request.headers);

        const body =
          request.method !== "GET" && request.body
            ? JSON.stringify(request.body)
            : undefined;

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body,
        });

        const response = await auth.handler(req);

        reply.status(response.status);
        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });

        const text = await response.text();
        return reply.send(text || null);
      } catch (error) {
        fastify.log.error(error, "Authentication error");
        return reply.status(500).send({
          success: false,
          message: "Internal authentication error",
          data: null,
          error: "AUTH_FAILURE",
        });
      }
    },
  });
});

import fp from "fastify-plugin";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { applyAuthResponseHeaders } from "../lib/auth-cookies";

export default fp(async (fastify) => {
  fastify.route({
    method: ["GET", "POST"],
    url: "/api/auth/*",
    async handler(request, reply) {
      request.log.info({ method: request.method, url: request.url }, "[auth-plugin] incoming request");
      console.log("PROTOCOL", request.protocol);
      console.log("XFP", request.headers["x-forwarded-proto"]);
      try {
        // /api is added because in production /api is needed for redirection and nginx is stripping down /api then passing to backend and then data is being saved in db that's why it does not exit in better auth config
        const url = new URL(
          `${request.url}`,
          `${request.protocol}://${request.headers.host}`
        );
        request.log.debug({ url: url.toString() }, "[auth-plugin] constructed web URL");

        const headers = fromNodeHeaders(request.headers);
        request.log.debug({ headerCount: [...headers.keys()].length }, "[auth-plugin] headers converted");

        const body =
          request.method !== "GET" && request.body
            ? JSON.stringify(request.body)
            : undefined;
        request.log.debug({ hasBody: body !== undefined }, "[auth-plugin] body extracted");

        const req = new Request(url.toString(), {
          method: request.method,
          headers,
          body,
        });

        request.log.info({ method: req.method, url: req.url }, "[auth-plugin] calling auth.handler");
        const response = await auth.handler(req);
        request.log.info({ status: response.status }, "[auth-plugin] auth.handler responded");

        reply.status(response.status);

        const setCookies = typeof response.headers.getSetCookie === "function"
          ? response.headers.getSetCookie()
          : [];
        request.log.debug({ setCookieCount: setCookies.length }, "[auth-plugin] applying response headers");
        applyAuthResponseHeaders(reply, response.headers);

        const text = await response.text();
        request.log.debug({ bodyLength: text.length }, "[auth-plugin] sending response body");

        return reply.send(text || null);
      } catch (error) {
        request.log.error({ err: error, method: request.method, url: request.url }, "[auth-plugin] unhandled error");
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

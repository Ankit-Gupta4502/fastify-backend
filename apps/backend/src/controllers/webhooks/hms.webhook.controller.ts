import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { drizzle } from "../../db";
import { instructorDetails, roomUsers, rooms } from "../../schema/schema";
import {
  BOOKING_STATUS,
  INSTRUCTOR_STATUS,
  ROOM_STATUS,
} from "../../constants/sessions";
import { verifyHmsWebhookSignature } from "../../services/hms.service";
import { successResponse } from "../../utils";

type HmsSessionCloseEvent = {
  type: string;
  data?: { room_id?: string };
};

export class HmsWebhookController {
  constructor(private readonly app: FastifyInstance) {
    this.register(app);
  }

  private register(app: FastifyInstance) {
    app.register(
      async (router) => {
        // Capture raw bytes before JSON parsing so we can verify the HMAC signature
        router.addContentTypeParser(
          "application/json",
          { parseAs: "buffer" },
          (_req, body, done) => {
            try {
              const parsed: unknown = JSON.parse((body as Buffer).toString("utf8"));
              (_req as FastifyRequest).rawBody = body as Buffer;
              done(null, parsed);
            } catch (err) {
              done(err as Error, undefined);
            }
          },
        );

        router.post(
          "/100ms",
          {
            schema: {
              description: "100ms webhook receiver",
              tags: ["Webhooks"] as string[],
            },
          },
          this.handle,
        );
      },
      { prefix: "/webhooks" },
    );
  }

  private handle = async (request: FastifyRequest, reply: FastifyReply) => {
    const signature = request.headers["x-100ms-signature"];

    const ok = () => {
      const { statusCode, payload } = successResponse({
        message: "ok",
        data: { received: true },
      });
      return reply.status(statusCode).send(payload);
    };

    if (typeof signature !== "string") {
      request.log.warn("100ms webhook: missing signature header");
      return ok();
    }

    if (!request.rawBody) {
      request.log.error("100ms webhook: rawBody not captured");
      return ok();
    }

    if (!verifyHmsWebhookSignature(request.rawBody, signature)) {
      request.log.warn("100ms webhook: invalid signature — ignoring event");
      return ok();
    }

    const event = request.body as HmsSessionCloseEvent | undefined;

    if (event?.type === "session.close.success" && event.data?.room_id) {
      const hmsRoomId = event.data.room_id;

      await drizzle.transaction(async (trx) => {
        const [room] = await trx
          .select({ id: rooms.id })
          .from(rooms)
          .where(eq(rooms.hmsRoomId, hmsRoomId));

        if (!room) return;

        await trx
          .update(rooms)
          .set({ status: ROOM_STATUS.ENDED, currentOccupancy: 0 })
          .where(eq(rooms.id, room.id));

        await trx
          .update(roomUsers)
          .set({ status: BOOKING_STATUS.COMPLETED, leftAt: new Date() })
          .where(eq(roomUsers.roomId, room.id));

        await trx
          .update(instructorDetails)
          .set({
            status: INSTRUCTOR_STATUS.AVAILABLE,
            currentRoomId: null,
          })
          .where(eq(instructorDetails.currentRoomId, room.id));
      });
    }

    return ok();
  };
}

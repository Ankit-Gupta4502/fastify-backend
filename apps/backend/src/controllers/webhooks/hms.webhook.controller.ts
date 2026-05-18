import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import { drizzle } from "../../db";
import { instructorDetails, roomUsers, rooms } from "../../schema/schema";
import {
  BOOKING_STATUS,
  INSTRUCTOR_STATUS,
  ROOM_STATUS,
} from "../../constants/sessions";
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
    // TODO: verify HMAC signature from 100ms before processing
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

    const { statusCode, payload } = successResponse({
      message: "ok",
      data: { received: true },
    });
    return reply.status(statusCode).send(payload);
  };
}

import { eq, sql } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { instructorDetails, rooms } from "../schema/schema";
import { INSTRUCTOR_STATUS, ROOM_STATUS } from "../constants/sessions";

export type FindSubstituteParams = {
  originalInstructorId: string;
  requiredSpecialties: string[];
  sessionStart: Date;
  sessionEnd: Date;
};

export async function findSubstitute(
  db: AppDatabase,
  params: FindSubstituteParams,
): Promise<string | null> {
  const result = await db.execute(sql`
    SELECT "i"."user_id"
    FROM "instructor_details" AS "i"
    WHERE "i"."status" = ${INSTRUCTOR_STATUS.AVAILABLE}
      AND "i"."user_id" <> ${params.originalInstructorId}
      AND "i"."specialty" && ${params.requiredSpecialties}::text[]
      AND NOT EXISTS (
        SELECT 1 FROM "rooms" AS "r"
        WHERE "r"."instructor_id" = "i"."user_id"
          AND "r"."status" <> ${ROOM_STATUS.ENDED}
          AND tstzrange("r"."scheduled_start", "r"."scheduled_end") &&
              tstzrange(${params.sessionStart.toISOString()}::timestamptz, ${params.sessionEnd.toISOString()}::timestamptz)
      )
    ORDER BY random()
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  `);

  const rows =
    (result as unknown as { rows?: unknown[] }).rows ??
    (result as unknown as unknown[]);
  const first = (rows as Array<{ user_id: string }>)[0];
  return first?.user_id ?? null;
}

export async function swapInstructor(
  db: AppDatabase,
  params: {
    roomId: string;
    newInstructorId: string;
    originalInstructorId: string;
  },
): Promise<void> {
  await db.transaction(async (trx) => {
    await trx
      .update(rooms)
      .set({
        instructorId: params.newInstructorId,
        originalInstructorId: params.originalInstructorId,
      })
      .where(eq(rooms.id, params.roomId));

    await trx
      .update(instructorDetails)
      .set({
        status: INSTRUCTOR_STATUS.BUSY,
        currentRoomId: params.roomId,
      })
      .where(eq(instructorDetails.userId, params.newInstructorId));
  });
}

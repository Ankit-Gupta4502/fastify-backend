import { eq, sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { SESSION_EARNING_PAISE } from "../constants/sessions";
import { instructorWallet, walletTransaction } from "../schema/schema";

/**
 * Credits SESSION_EARNING_PAISE to the instructor's wallet once per room.
 * Safe to call inside an existing transaction — pass the trx object.
 * The unique constraint on (wallet_id, room_id) makes it idempotent.
 */
export async function creditSessionEarning(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trx: PgTransaction<any, any, any>,
  instructorId: string,
  roomId: string,
): Promise<void> {
  // Upsert wallet row (created on first earning)
  const [wallet] = await trx
    .insert(instructorWallet)
    .values({ instructorId, balancePaise: SESSION_EARNING_PAISE })
    .onConflictDoUpdate({
      target: instructorWallet.instructorId,
      set: {
        balancePaise: sql`${instructorWallet.balancePaise} + ${SESSION_EARNING_PAISE}`,
        updatedAt: new Date(),
      },
    })
    .returning({ id: instructorWallet.id });

  // Record transaction — unique constraint prevents duplicate credits for the same room
  await trx
    .insert(walletTransaction)
    .values({
      walletId: wallet.id,
      instructorId,
      roomId,
      amountPaise: SESSION_EARNING_PAISE,
      type: "session_credit",
      description: `Session completed — ₹${SESSION_EARNING_PAISE / 100} credited`,
    })
    .onConflictDoNothing();
}

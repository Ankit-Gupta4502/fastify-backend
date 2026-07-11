-- Instructor wallet: one row per instructor, stores cumulative balance in paise
CREATE TYPE "wallet_transaction_type" AS ENUM ('session_credit');
--> statement-breakpoint
CREATE TABLE "instructor_wallet" (
  "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "instructor_id"   uuid NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "balance_paise"   bigint NOT NULL DEFAULT 0,
  "created_at"      timestamptz NOT NULL DEFAULT now(),
  "updated_at"      timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wallet_transaction" (
  "id"            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "wallet_id"     uuid NOT NULL REFERENCES "instructor_wallet"("id") ON DELETE CASCADE,
  "instructor_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "room_id"       uuid REFERENCES "rooms"("id") ON DELETE SET NULL,
  "amount_paise"  bigint NOT NULL,
  "type"          wallet_transaction_type NOT NULL,
  "description"   text,
  "created_at"    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "uq_wallet_tx_room" UNIQUE ("wallet_id", "room_id")
);
--> statement-breakpoint
CREATE INDEX "idx_wallet_tx_instructor" ON "wallet_transaction" ("instructor_id", "created_at");

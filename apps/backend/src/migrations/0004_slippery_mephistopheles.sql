CREATE TYPE "public"."wallet_transaction_type" AS ENUM('session_credit');--> statement-breakpoint
CREATE TABLE "instructor_wallet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"instructor_id" uuid NOT NULL,
	"balance_paise" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "instructor_wallet_instructor_id_unique" UNIQUE("instructor_id")
);
--> statement-breakpoint
CREATE TABLE "wallet_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wallet_id" uuid NOT NULL,
	"instructor_id" uuid NOT NULL,
	"room_id" uuid,
	"amount_paise" bigint NOT NULL,
	"type" "wallet_transaction_type" NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_wallet_tx_room" UNIQUE("wallet_id","room_id")
);
--> statement-breakpoint
ALTER TABLE "instructor_details" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "price_per_session_cents" integer;--> statement-breakpoint
ALTER TABLE "plans" ADD COLUMN "category" text DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "instructor_wallet" ADD CONSTRAINT "instructor_wallet_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_wallet_id_instructor_wallet_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."instructor_wallet"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_transaction" ADD CONSTRAINT "wallet_transaction_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_wallet_tx_instructor" ON "wallet_transaction" USING btree ("instructor_id","created_at");
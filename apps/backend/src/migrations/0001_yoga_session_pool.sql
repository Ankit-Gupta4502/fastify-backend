-- Yoga session-pool extensions.
-- Run this AFTER `drizzle-kit generate` produces the auto migration for
-- plans, rooms, instructor_details, room_users, session_quota_log and the
-- new columns on "user".

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Circular FK: instructor_details.current_room_id -> rooms(id)
ALTER TABLE "instructor_details"
  ADD CONSTRAINT "fk_instructor_current_room"
  FOREIGN KEY ("current_room_id") REFERENCES "rooms"("id");
--> statement-breakpoint

-- Partial unique index: a user can only have one active booking per room
CREATE UNIQUE INDEX IF NOT EXISTS "idx_room_users_active"
  ON "room_users" ("room_id", "user_id")
  WHERE "left_at" IS NULL;
--> statement-breakpoint

-- Tighten pool-scan index to the rows we actually scan
DROP INDEX IF EXISTS "idx_rooms_pool";
CREATE INDEX "idx_rooms_pool"
  ON "rooms" ("type", "status", "current_occupancy")
  WHERE "type" = 'group' AND "status" IN ('idle', 'active');
--> statement-breakpoint

DROP INDEX IF EXISTS "idx_rooms_schedule";
CREATE INDEX "idx_rooms_schedule"
  ON "rooms" ("scheduled_start")
  WHERE "status" IN ('idle', 'active') AND "type" = 'group';
--> statement-breakpoint

-- Seed plans (idempotent)
INSERT INTO "plans"
  ("name", "price_cents", "sessions_per_week", "allows_private", "allows_time_flexibility", "max_room_capacity")
VALUES
  ('group_live', 3300, 3,    FALSE, FALSE, 20),
  ('private',    8900, NULL, TRUE,  TRUE,  2),
  ('on_demand',  1900, NULL, FALSE, FALSE, NULL)
ON CONFLICT ("name") DO NOTHING;
--> statement-breakpoint

-- Weekly quota reset. Requires pg_cron to be installed and enabled.
-- Uncomment after `CREATE EXTENSION pg_cron;` has been run.
--
-- SELECT cron.schedule(
--   'reset-weekly-quota',
--   '5 0 * * MON',
--   $$
--   UPDATE "user"
--      SET "sessions_used_this_week" = 0,
--          "week_reset_at"           = date_trunc('week', now())
--    WHERE "role" = 'user'
--      AND "plan_id" IN (SELECT "id" FROM "plans" WHERE "sessions_per_week" IS NOT NULL)
--   $$
-- );

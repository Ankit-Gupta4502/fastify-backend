import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  INSTRUCTOR_STATUS,
  INSTRUCTOR_STATUS_VALUES,
} from "../constants/sessions";
import { user } from "./auth.schema";
import { rooms } from "./rooms";

export const instructorStatusEnum = pgEnum(
  "instructor_status",
  INSTRUCTOR_STATUS_VALUES as [string, ...string[]],
);

export type AvailabilityWindow = {
  dow: number;
  start: string;
  end: string;
};

export const instructorDetails = pgTable(
  "instructor_details",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    status: instructorStatusEnum("status")
      .notNull()
      .default(INSTRUCTOR_STATUS.AVAILABLE),
    currentRoomId: uuid("current_room_id"),
    specialty: text("specialty")
      .array()
      .notNull()
      .default([] as unknown as string[]),
    maxConcurrentSessions: integer("max_concurrent_sessions")
      .notNull()
      .default(1),
    availabilityJson: jsonb("availability_json").$type<AvailabilityWindow[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_instructor_status").on(t.status)],
);

export const instructorDetailsRelations = relations(
  instructorDetails,
  ({ one }) => ({
    user: one(user, {
      relationName: "instructorProfile",
      fields: [instructorDetails.userId],
      references: [user.id],
    }),
    currentRoom: one(rooms, {
      fields: [instructorDetails.currentRoomId],
      references: [rooms.id],
    }),
  }),
);

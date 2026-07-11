import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  ROOM_STATUS,
  ROOM_STATUS_VALUES,
  ROOM_TYPE_VALUES,
} from "../constants/sessions";
import { user } from "./auth.schema";

export const roomTypeEnum = pgEnum("room_type", ROOM_TYPE_VALUES as [
  string,
  ...string[],
]);

export const roomStatusEnum = pgEnum(
  "room_status",
  ROOM_STATUS_VALUES as [string, ...string[]],
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: roomTypeEnum("type").notNull(),
    status: roomStatusEnum("status").notNull().default(ROOM_STATUS.IDLE),
    instructorId: uuid("instructor_id")
      .notNull()
      .references(() => user.id),
    originalInstructorId: uuid("original_instructor_id").references(
      () => user.id,
    ),
    name: text("name"),
    capacity: integer("capacity").notNull().default(20),
    currentOccupancy: integer("current_occupancy").notNull().default(0),
    scheduledStart: timestamp("scheduled_start", {
      withTimezone: true,
    }).notNull(),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }).notNull(),
    meetLink: text("meet_link"),
    hmsRoomId: text("hms_room_id").unique(),
    hmsRoomCode: text("hms_room_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_rooms_pool").on(t.type, t.status, t.currentOccupancy),
    index("idx_rooms_schedule").on(t.scheduledStart),
    check("current_occupancy_non_negative", sql`${t.currentOccupancy} >= 0`),
  ],
);

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  instructor: one(user, {
    relationName: "roomInstructor",
    fields: [rooms.instructorId],
    references: [user.id],
  }),
  originalInstructor: one(user, {
    relationName: "roomOriginalInstructor",
    fields: [rooms.originalInstructorId],
    references: [user.id],
  }),
}));

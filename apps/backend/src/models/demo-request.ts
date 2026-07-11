import { relations } from "drizzle-orm";
import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const demoRequestStatusEnum = pgEnum("demo_request_status", [
  "pending",
  "approved",
  "rejected",
  "needs_information",
  "instructor_assigned",
  "meeting_scheduled",
  "completed",
]);

export const demoRequests = pgTable(
  "demo_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Personal info
    gender: text("gender").notNull(),
    phone: text("phone"),

    // Goals
    purposes: text("purposes").array().notNull(),
    otherPurpose: text("other_purpose"),

    // Schedule (user's local terms + resolved UTC)
    preferredDate: text("preferred_date").notNull(),
    preferredTime: text("preferred_time").notNull(),
    timezone: text("timezone").notNull(),
    utcScheduledAt: timestamp("utc_scheduled_at", {
      withTimezone: true,
    }).notNull(),

    // Assignment
    assignedInstructorId: uuid("assigned_instructor_id").references(
      () => user.id,
    ),
    meetingLink: text("meeting_link"),
    meetingPlatform: text("meeting_platform"),

    // Status tracking
    status: demoRequestStatusEnum("status").notNull().default("pending"),
    rejectionReason: text("rejection_reason"),
    needsInfoMessage: text("needs_info_message"),
    adminNotes: text("admin_notes"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_demo_requests_user").on(t.userId),
    index("idx_demo_requests_status").on(t.status),
    index("idx_demo_requests_utc").on(t.utcScheduledAt),
  ],
);

export const demoRequestsRelations = relations(demoRequests, ({ one }) => ({
  user: one(user, {
    relationName: "demoUser",
    fields: [demoRequests.userId],
    references: [user.id],
  }),
  assignedInstructor: one(user, {
    relationName: "demoInstructor",
    fields: [demoRequests.assignedInstructorId],
    references: [user.id],
  }),
}));

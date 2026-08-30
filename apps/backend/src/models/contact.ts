import { index, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const contactQueryStatusEnum = pgEnum("contact_query_status", [
  "new",
  "resolved",
]);

export const contactQueries = pgTable(
  "contact_queries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    status: contactQueryStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_contact_queries_status").on(t.status),
    index("idx_contact_queries_created_at").on(t.createdAt),
  ],
);

export const corporateInquiries = pgTable(
  "corporate_inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    companyName: text("company_name").notNull(),
    teamSize: text("team_size").notNull(),
    phone: text("phone"),
    wellnessGoal: text("wellness_goal").notNull(),
    status: contactQueryStatusEnum("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (t) => [
    index("idx_corporate_inquiries_status").on(t.status),
    index("idx_corporate_inquiries_created_at").on(t.createdAt),
  ],
);

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

export const userAcquisition = pgTable("user_acquisition", {
  userId: uuid("user_id").primaryKey().references(() => user.id, { onDelete: "cascade" }),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmContent: text("utm_content"),
  utmTerm: text("utm_term"),
  referrer: text("referrer"),
  landingPage: text("landing_page"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

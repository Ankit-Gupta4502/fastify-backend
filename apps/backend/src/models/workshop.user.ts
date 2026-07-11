import { integer, pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { workshops } from "./workshops";

export const registeredWorkshops = pgTable(
  "workshop_user",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workshopId: uuid("workshop_id")
      .notNull()
      .references(() => workshops.id)
      .notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    utmSource: text("utm_source"),
    razorpayOrderId: text("razorpay_order_id").unique(),
    razorpayPaymentId: text("razorpay_payment_id"),
    pricePaid: integer("price_paid"),
    currency: text("currency"),
  },
  (t) => [unique("workshop_user_workshop_email_unique").on(t.workshopId, t.email)],
);



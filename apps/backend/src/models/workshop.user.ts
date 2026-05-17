import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { workshops } from "./workshops";

export const registeredWorkshops = pgTable("workshop_user", {
  id: uuid("id").defaultRandom().primaryKey(),
  workshopId: uuid("workshop_id")
    .notNull()
    .references(() => workshops.id)
    .notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
});



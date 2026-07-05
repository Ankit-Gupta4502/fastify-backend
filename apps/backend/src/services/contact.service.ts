import { desc, eq } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { contactQueries } from "../schema/schema";

type DB = AppDatabase;

export async function createContactQuery(
  db: DB,
  body: { name: string; email: string; subject: string; message: string },
): Promise<{ id: string }> {
  const [created] = await db
    .insert(contactQueries)
    .values(body)
    .returning({ id: contactQueries.id });

  return created;
}

export async function listContactQueries(db: DB) {
  const rows = await db
    .select()
    .from(contactQueries)
    .orderBy(desc(contactQueries.createdAt));

  return rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));
}

export async function markContactQueryResolved(
  db: DB,
  id: string,
): Promise<boolean> {
  const [existing] = await db
    .select({ id: contactQueries.id })
    .from(contactQueries)
    .where(eq(contactQueries.id, id))
    .limit(1);

  if (!existing) return false;

  await db
    .update(contactQueries)
    .set({ status: "resolved" })
    .where(eq(contactQueries.id, id));

  return true;
}

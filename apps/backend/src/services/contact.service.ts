import { desc, eq } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { contactQueries, corporateInquiries } from "../schema/schema";

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

export async function createCorporateInquiry(
  db: DB,
  body: {
    name: string;
    email: string;
    companyName: string;
    teamSize: string;
    phone?: string;
    wellnessGoal: string;
  },
): Promise<{ id: string }> {
  const [created] = await db.insert(corporateInquiries).values({
    ...body,
    phone: body.phone || null,
  }).returning({ id: corporateInquiries.id });
  return created;
}

export async function listCorporateInquiries(db: DB) {
  const rows = await db.select().from(corporateInquiries).orderBy(desc(corporateInquiries.createdAt));
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function markCorporateInquiryResolved(db: DB, id: string): Promise<boolean> {
  const [existing] = await db.select({ id: corporateInquiries.id }).from(corporateInquiries)
    .where(eq(corporateInquiries.id, id)).limit(1);
  if (!existing) return false;
  await db.update(corporateInquiries).set({ status: "resolved" }).where(eq(corporateInquiries.id, id));
  return true;
}

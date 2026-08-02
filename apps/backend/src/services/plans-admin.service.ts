import { eq } from "drizzle-orm";
import type { AppDatabase } from "../types/database.types";
import { corporatePlans, plans } from "../schema/schema";
import type {
  CreateCorporatePlanBody,
  CreatePlanBody,
  UpdateCorporatePlanBody,
  UpdatePlanBody,
} from "../validation/plans-admin.validation.schema";

// ─── Individual plans ─────────────────────────────────────────────────────────

export async function listAllPlans(db: AppDatabase) {
  return db.select().from(plans).orderBy(plans.createdAt);
}

export async function createPlan(db: AppDatabase, body: CreatePlanBody) {
  const [row] = await db.insert(plans).values(body).returning();
  return row;
}

export async function updatePlan(db: AppDatabase, id: string, body: UpdatePlanBody) {
  const [row] = await db
    .update(plans)
    .set(body)
    .where(eq(plans.id, id))
    .returning();
  return row ?? null;
}

// ─── Corporate plans ──────────────────────────────────────────────────────────

export async function listCorporatePlansAdmin(db: AppDatabase) {
  return db
    .select({
      id: corporatePlans.id,
      name: corporatePlans.name,
      linkedPlanId: corporatePlans.linkedPlanId,
      linkedPlanName: plans.name,
      basePricePerSeatCents: corporatePlans.basePricePerSeatCents,
      basePricePerSeatInrPaise: corporatePlans.basePricePerSeatInrPaise,
      billingInterval: corporatePlans.billingInterval,
      createdAt: corporatePlans.createdAt,
    })
    .from(corporatePlans)
    .innerJoin(plans, eq(corporatePlans.linkedPlanId, plans.id))
    .orderBy(corporatePlans.createdAt);
}

export async function createCorporatePlan(db: AppDatabase, body: CreateCorporatePlanBody) {
  const [linkedPlan] = await db.select({ id: plans.id }).from(plans).where(eq(plans.id, body.linkedPlanId));
  if (!linkedPlan) return { error: "linked_plan_not_found" as const };

  const [row] = await db.insert(corporatePlans).values(body).returning();
  return { row };
}

export async function updateCorporatePlan(
  db: AppDatabase,
  id: string,
  body: UpdateCorporatePlanBody,
) {
  if (body.linkedPlanId) {
    const [linkedPlan] = await db.select({ id: plans.id }).from(plans).where(eq(plans.id, body.linkedPlanId));
    if (!linkedPlan) return { error: "linked_plan_not_found" as const };
  }

  const [row] = await db
    .update(corporatePlans)
    .set(body)
    .where(eq(corporatePlans.id, id))
    .returning();
  return { row: row ?? null };
}

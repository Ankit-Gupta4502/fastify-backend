import { and, eq } from "drizzle-orm";
import { drizzle } from "../db";
import { plans, sessionPlanRazorpayPlans } from "../schema/schema";
import { getRazorpay } from "./razorpay.service";

type BillingPeriod = "weekly" | "monthly";

export async function getOrCreateStandardRazorpayPlan(params: {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  period: BillingPeriod;
  isIndia: boolean;
}): Promise<string> {
  const [plan] = await drizzle
    .select({
      razorpayPlanIdInr: plans.razorpayPlanIdInr,
      razorpayPlanIdUsd: plans.razorpayPlanIdUsd,
    })
    .from(plans)
    .where(eq(plans.id, params.planId))
    .limit(1);

  let rpPlanId = params.isIndia ? plan?.razorpayPlanIdInr : plan?.razorpayPlanIdUsd;
  if (rpPlanId) return rpPlanId;

  const rpPlan = await getRazorpay().plans.create({
    item: { name: params.planName, amount: params.amount, currency: params.currency },
    period: params.period,
    interval: 1,
    notes: { planId: params.planId },
  });
  rpPlanId = rpPlan.id;

  await drizzle
    .update(plans)
    .set(params.isIndia ? { razorpayPlanIdInr: rpPlanId } : { razorpayPlanIdUsd: rpPlanId })
    .where(eq(plans.id, params.planId));

  return rpPlanId;
}

export async function getOrCreateSessionRazorpayPlan(params: {
  planId: string;
  planName: string;
  sessionCount: number;
  amount: number;
  currency: string;
  period: BillingPeriod;
}): Promise<string> {
  const [cached] = await drizzle
    .select({ razorpayPlanId: sessionPlanRazorpayPlans.razorpayPlanId })
    .from(sessionPlanRazorpayPlans)
    .where(
      and(
        eq(sessionPlanRazorpayPlans.planId, params.planId),
        eq(sessionPlanRazorpayPlans.sessionCount, params.sessionCount),
        eq(sessionPlanRazorpayPlans.currency, params.currency),
      ),
    )
    .limit(1);

  if (cached) return cached.razorpayPlanId;

  const rpPlan = await getRazorpay().plans.create({
    item: {
      name: `${params.planName} — ${params.sessionCount} sessions/mo`,
      amount: params.amount,
      currency: params.currency,
    },
    period: params.period,
    interval: 1,
    notes: { planId: params.planId, sessionCount: String(params.sessionCount) },
  });

  await drizzle.insert(sessionPlanRazorpayPlans).values({
    planId: params.planId,
    sessionCount: params.sessionCount,
    currency: params.currency,
    razorpayPlanId: rpPlan.id,
  });

  return rpPlan.id;
}

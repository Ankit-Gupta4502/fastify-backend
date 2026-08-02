import { and, eq } from "drizzle-orm";
import { drizzle } from "../db";
import { coupons, organizationMembers } from "../schema/schema";

type Coupon = typeof coupons.$inferSelect;

export type CouponValidationResult =
  | { valid: true; coupon: Coupon }
  | {
      valid: false;
      reason: "not_found" | "inactive" | "expired" | "not_a_member";
    };

// Generic coupon validation, reusable beyond corporate discounts — an
// "organization"-scoped coupon additionally requires the requesting user to
// be a joined member of that org (otherwise a leaked code could be used by
// anyone).
export async function validateCouponForUser(
  code: string,
  userId: string,
): Promise<CouponValidationResult> {
  const [coupon] = await drizzle
    .select()
    .from(coupons)
    .where(eq(coupons.code, code));

  if (!coupon) return { valid: false, reason: "not_found" };
  if (!coupon.isActive) return { valid: false, reason: "inactive" };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  if (coupon.scope === "organization") {
    if (!coupon.organizationId) return { valid: false, reason: "not_found" };

    const [membership] = await drizzle
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.organizationId, coupon.organizationId),
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.status, "joined"),
        ),
      );
    if (!membership) return { valid: false, reason: "not_a_member" };
  }

  return { valid: true, coupon };
}

// `type: "percent"` treats `value` as 0-100. `type: "flat"` treats `value` as
// smallest-currency-unit (cents/paise) in whatever currency the checkout is
// already charging.
export function applyCouponDiscount(
  amount: number,
  coupon: Pick<Coupon, "type" | "value">,
): number {
  if (coupon.type === "percent") {
    return Math.max(0, Math.round(amount * (1 - coupon.value / 100)));
  }
  return Math.max(0, amount - coupon.value);
}

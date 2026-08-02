import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { backendEnvPath } from "../config/env";

dotenv.config({ path: backendEnvPath });

const { drizzle } = await import("./index");
const { corporatePlans, corporateSeatTiers, plans } = await import(
  "../schema/schema"
);

const SEAT_TIERS = [
  { label: "5-10", minSeats: 5, maxSeats: 10, discountPercent: 5, sortOrder: 0 },
  { label: "10-50", minSeats: 10, maxSeats: 50, discountPercent: 10, sortOrder: 1 },
  { label: "50-100", minSeats: 50, maxSeats: 100, discountPercent: 15, sortOrder: 2 },
  { label: "100+", minSeats: 100, maxSeats: null, discountPercent: 20, sortOrder: 3 },
];

async function seedSeatTiers() {
  for (const tier of SEAT_TIERS) {
    const [existing] = await drizzle
      .select({ id: corporateSeatTiers.id })
      .from(corporateSeatTiers)
      .where(eq(corporateSeatTiers.label, tier.label));

    if (existing) {
      await drizzle
        .update(corporateSeatTiers)
        .set(tier)
        .where(eq(corporateSeatTiers.id, existing.id));
      console.log(`updated seat tier: ${tier.label}`);
    } else {
      await drizzle.insert(corporateSeatTiers).values(tier);
      console.log(`inserted seat tier: ${tier.label}`);
    }
  }
}

async function seedCorporatePlans() {
  const [groupLivePlan] = await drizzle
    .select()
    .from(plans)
    .where(eq(plans.name, "group_live"));

  if (!groupLivePlan) {
    throw new Error("group_live plan not found — cannot seed corporate plans");
  }

  const name = "Corporate Group Plan";
  const [existing] = await drizzle
    .select({ id: corporatePlans.id })
    .from(corporatePlans)
    .where(eq(corporatePlans.name, name));

  const values = {
    name,
    linkedPlanId: groupLivePlan.id,
    basePricePerSeatCents: groupLivePlan.priceCents,
    basePricePerSeatInrPaise: groupLivePlan.priceInrPaise,
    billingInterval: groupLivePlan.billingInterval,
  };

  if (existing) {
    await drizzle
      .update(corporatePlans)
      .set(values)
      .where(eq(corporatePlans.id, existing.id));
    console.log(`updated corporate plan: ${name}`);
  } else {
    await drizzle.insert(corporatePlans).values(values);
    console.log(`inserted corporate plan: ${name}`);
  }
}

await seedSeatTiers();
await seedCorporatePlans();
console.log("Corporate plans/seat tiers seeded successfully");
process.exit(0);

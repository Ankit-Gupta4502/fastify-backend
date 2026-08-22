import dotenv from "dotenv";
import { eq } from "drizzle-orm";
import { backendEnvPath } from "../config/env";

dotenv.config({ path: backendEnvPath });

const { drizzle } = await import("./index");
const { corporatePlans, plans } = await import("../schema/schema");

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

await seedCorporatePlans();
console.log("Corporate plans seeded successfully");
process.exit(0);

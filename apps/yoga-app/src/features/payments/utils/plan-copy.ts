import type { PlanRecord } from "@yoga-app/shared";
import { calcCustomPriceCents } from "@yoga-app/shared";

export const PLAN_COPY: Record<string, { title: string; tagline: string; perks: string[] }> = {
  group_live: {
    title: "Group Live",
    tagline: "Live group flows with elite instructors.",
    perks: [
      "Unlimited group classes",
      "Access to all group rooms",
      "Local-time auto conversion",
      "Cancel any time",
    ],
  },
  private: {
    title: "Private",
    tagline: "1:1 sessions with your chosen instructor.",
    perks: [
      "4 private sessions / week",
      "Unlimited group classes",
      "Time-of-day flexibility",
      "Direct instructor messaging",
      "Priority support",
    ],
  },
  prenatal_postnatal: {
    title: "Prenatal & Postnatal",
    tagline: "Safe, guided yoga for every stage of motherhood.",
    perks: [
      "1:1 with certified prenatal instructor",
      "Trimester-specific sequences",
      "Postpartum recovery flows",
      "Priority scheduling",
    ],
  },
  therapeutic_yoga: {
    title: "Therapeutic Yoga",
    tagline: "Targeted sessions to heal, restore, and strengthen.",
    perks: [
      "1:1 with a therapeutic specialist",
      "Personalised injury-recovery plans",
      "Breathwork & stress relief",
      "Progress tracking",
    ],
  },
};

export function getPlanLabel(planName: string): string {
  if (planName.startsWith("custom_private_")) {
    const parts = planName.split("_");
    const sessions = parts[parts.length - 1];
    return `Private 1:1 · ${sessions} sessions/mo`;
  }
  return PLAN_COPY[planName]?.title ?? planName.replace(/_/g, " ");
}

export function getPlanPriceCents(planName: string, plans: PlanRecord[]): number {
  if (planName.startsWith("custom_private_")) {
    const parts = planName.split("_");
    const sessions = parseInt(parts[parts.length - 1] ?? "4", 10);
    return calcCustomPriceCents(isNaN(sessions) ? 4 : sessions);
  }
  return plans.find((p) => p.name === planName)?.priceCents ?? 0;
}

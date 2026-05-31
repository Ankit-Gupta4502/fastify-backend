export type PlanName = "group_live" | "private" | "prenatal_postnatal" | "therapeutic_yoga" | (string & {});
export type PlanCategory = "standard" | "specialized";
export type BillingInterval = "week" | "month";

export interface PlanRecord {
  id: string;
  name: PlanName;
  priceCents: number;
  pricePerSessionCents: number | null;
  billingInterval: BillingInterval;
  sessionsPerWeek: number | null;
  sessionsPerMonth: number | null;
  allowsPrivate: boolean;
  allowsTimeFlexibility: boolean;
  maxRoomCapacity: number | null;
  category: PlanCategory;
}

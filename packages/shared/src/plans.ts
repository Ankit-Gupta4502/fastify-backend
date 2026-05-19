export type PlanName = "group_live" | "private" | (string & {});
export type BillingInterval = "week" | "month";

export interface PlanRecord {
  id: string;
  name: PlanName;
  priceCents: number;
  billingInterval: BillingInterval;
  sessionsPerWeek: number | null;
  sessionsPerMonth: number | null;
  allowsPrivate: boolean;
  allowsTimeFlexibility: boolean;
  maxRoomCapacity: number | null;
}

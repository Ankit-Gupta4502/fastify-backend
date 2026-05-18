export type PlanName = "group_live" | "private" | "on_demand";

export interface PlanRecord {
  id: string;
  name: PlanName;
  priceCents: number;
  sessionsPerWeek: number | null;
  allowsPrivate: boolean;
  allowsTimeFlexibility: boolean;
  maxRoomCapacity: number | null;
}

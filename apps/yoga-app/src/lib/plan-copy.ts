export const PLAN_COPY: Record<string, { title: string; tagline: string; perks: string[] }> = {
  group_live: {
    title: "Group Live",
    tagline: "Live group flows with elite instructors.",
    perks: [
      "4 live group sessions / week",
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

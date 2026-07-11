import type { Goal, Frequency, Need, PlanSlug, Recommendation, Answers } from "./quiz-types";

// ── Recommendation engine ─────────────────────────────────────────────────────

export const RECOMMENDATIONS: Record<PlanSlug, Recommendation> = {
  private: {
    slug: "private",
    emoji: "🎯",
    title: "Private 1:1",
    tagline: "Personalised, on your schedule",
    why: "With your goals and commitment level, a dedicated instructor who adapts every session to you will get you there fastest.",
    gradient: "from-primary/20 via-primary/8 to-transparent",
    href: "/pricing",
  },
  prenatal_postnatal: {
    slug: "prenatal_postnatal",
    emoji: "🌸",
    title: "Prenatal & Postnatal",
    tagline: "Safe yoga for every stage of motherhood",
    why: "Trimester-specific sequences and postpartum flows designed for exactly where you are in your journey.",
    gradient: "from-rose-500/20 via-pink-400/8 to-transparent",
    href: "/pricing",
  },
  therapeutic_yoga: {
    slug: "therapeutic_yoga",
    emoji: "💚",
    title: "Therapeutic Yoga",
    tagline: "Heal, restore, and strengthen",
    why: "A specialist-led plan with personalised recovery sequences will address your specific needs safely and effectively.",
    gradient: "from-emerald-500/20 via-teal-400/8 to-transparent",
    href: "/pricing",
  },
};

export function computeRecommendation(answers: Answers): Recommendation {
  if (answers.need === "prenatal") return RECOMMENDATIONS.prenatal_postnatal;
  if (answers.need === "injury")   return RECOMMENDATIONS.therapeutic_yoga;
  return RECOMMENDATIONS.private;
}

// ── Option data ───────────────────────────────────────────────────────────────

export const GOALS: { value: Goal; label: string; emoji: string; color: string }[] = [
  { value: "stress",      label: "Stress relief",   emoji: "🧘", color: "bg-sky-500/10 hover:bg-sky-500/15 border-sky-500/20 data-[sel]:bg-sky-500/20 data-[sel]:border-sky-500/40" },
  { value: "flexibility", label: "Flexibility",      emoji: "🌿", color: "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 data-[sel]:bg-emerald-500/20 data-[sel]:border-emerald-500/40" },
  { value: "strength",    label: "Strength",         emoji: "💪", color: "bg-amber-500/10 hover:bg-amber-500/15 border-amber-500/20 data-[sel]:bg-amber-500/20 data-[sel]:border-amber-500/40" },
  { value: "recovery",    label: "Pain & recovery",  emoji: "❤️‍🩹", color: "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/20 data-[sel]:bg-rose-500/20 data-[sel]:border-rose-500/40" },
  { value: "spiritual",   label: "Spiritual growth", emoji: "✨", color: "bg-violet-500/10 hover:bg-violet-500/15 border-violet-500/20 data-[sel]:bg-violet-500/20 data-[sel]:border-violet-500/40" },
];

export const FREQUENCIES: { value: Frequency; label: string; sub: string; emoji: string }[] = [
  { value: "casual",  label: "1–2× a week", sub: "Light touch",       emoji: "🌱" },
  { value: "regular", label: "3–4× a week", sub: "Committed practice", emoji: "🔥" },
  { value: "daily",   label: "Every day",   sub: "Deep immersion",     emoji: "⚡" },
];

export const NEEDS: { value: Need; label: string; sub: string; emoji: string }[] = [
  { value: "none",     label: "Just here for the flow",  sub: "No specific requirements", emoji: "🌊" },
  { value: "prenatal", label: "Prenatal or postnatal",   sub: "Pregnancy-safe sequences",  emoji: "🌸" },
  { value: "injury",   label: "Injury or chronic pain",  sub: "Therapeutic approach",      emoji: "💚" },
];

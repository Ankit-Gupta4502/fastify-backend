import {
  ShieldCheck, RefreshCcw, Sparkles, Zap, CreditCard, BadgeCheck, HeartHandshake,
  Lock, Baby, HeartPulse,
} from "lucide-react";
import {
  PRICE_PER_SESSION_CENTS,
  PRICE_DISCOUNT_CENTS,
  MIN_SESSIONS,
  MAX_SESSIONS,
  calcCustomPriceCents,
} from "@yoga-app/shared";

export { PRICE_PER_SESSION_CENTS, PRICE_DISCOUNT_CENTS, MIN_SESSIONS, MAX_SESSIONS };

export function calcPrivatePrice(sessions: number) {
  return calcCustomPriceCents(sessions);
}

export function calcSpecializedPrice(sessions: number) {
  return sessions * PRICE_PER_SESSION_CENTS;
}

export const planMeta: Record<string, {
  icon: React.ElementType;
  badge?: string;
  gradient: string;
  iconBg: string;
  shimmer: string;
}> = {
  private: {
    icon: Lock,
    gradient: "from-primary/12 via-primary/5 to-transparent",
    iconBg: "bg-primary/12 text-primary",
    shimmer: "from-transparent via-primary/50 to-transparent",
  },
};

export type SpecializedPlanConfigEntry = {
  title: string;
  tagline: string;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  shimmer: string;
  perks: string[];
};

export const specializedPlanConfig: Record<string, SpecializedPlanConfigEntry> = {
  prenatal_postnatal: {
    title: "Prenatal & Postnatal",
    tagline: "Safe, guided yoga for every stage of motherhood.",
    icon: Baby,
    gradient: "from-rose-500/8 via-pink-400/4 to-transparent",
    iconBg: "bg-rose-500/10 text-rose-500",
    shimmer: "from-transparent via-rose-400/40 to-transparent",
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
    icon: HeartPulse,
    gradient: "from-emerald-500/8 via-teal-400/4 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-500",
    shimmer: "from-transparent via-emerald-400/40 to-transparent",
    perks: [
      "1:1 with a therapeutic specialist",
      "Personalised injury-recovery plans",
      "Breathwork & stress relief",
      "Progress tracking",
    ],
  },
};

export const faqs = [
  {
    icon: RefreshCcw,
    q: "Can I switch plans?",
    a: "Upgrade or downgrade any time from your dashboard. Changes take effect on your next billing date — no penalties.",
  },
  {
    icon: Sparkles,
    q: "Is there a free trial?",
    a: "Every new account gets a 14-day free trial. No credit card required to start.",
  },
  {
    icon: Zap,
    q: "How does the session quota work?",
    a: "Your weekly session count resets every Monday at midnight UTC. Unused sessions don't carry over to the next week.",
  },
  {
    icon: CreditCard,
    q: "What payment methods are accepted?",
    a: "All major credit/debit cards and UPI via Razorpay. We never store your card information on our servers.",
  },
];

export const trustSignals = [
  { icon: ShieldCheck, label: "256-bit SSL encryption" },
  { icon: BadgeCheck, label: "Razorpay certified" },
  { icon: RefreshCcw, label: "Cancel any time" },
  { icon: HeartHandshake, label: "30-day money back" },
];

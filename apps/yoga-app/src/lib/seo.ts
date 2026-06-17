import { APP_NAME } from "@yoga-app/shared";

export const SITE = {
  url: "https://bookyouryogateacher.com",
  name: APP_NAME,
  defaultImage: "https://bookyouryogateacher.com/images/hero-meditation.png",
} as const;

interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage?: string;
}

function buildPageHead(cfg: SeoConfig) {
  const image = cfg.ogImage ?? SITE.defaultImage;
  return {
    meta: [
      { title: cfg.title },
      { name: "description" as const, content: cfg.description },
      { name: "keywords" as const, content: cfg.keywords },
      { property: "og:title", content: cfg.title },
      { property: "og:description", content: cfg.description },
      { property: "og:image", content: image },
      { property: "og:url", content: cfg.canonical },
      { name: "twitter:title" as const, content: cfg.title },
      { name: "twitter:description" as const, content: cfg.description },
      { name: "twitter:image" as const, content: image },
    ],
    links: [{ rel: "canonical" as const, href: cfg.canonical }],
  };
}

// Per-page SEO — keyed by route name.
export const PAGE_SEO = {
  home: buildPageHead({
    title: "Book Your Yoga Teacher | Live Online Yoga Classes",
    description:
      "Book live 1-on-1 and group yoga classes with certified instructors. Prenatal yoga, therapeutic yoga, stress relief, flexibility, and more — from home.",
    keywords:
      "online yoga classes, book yoga teacher, live yoga sessions, prenatal yoga, therapeutic yoga, stress relief yoga, private yoga instructor, group yoga class, yoga for beginners, mindfulness meditation",
    canonical: `${SITE.url}/`,
  }),

  pricing: buildPageHead({
    title: "Yoga Class Plans & Pricing | Book Your Yoga Teacher",
    description:
      "Flexible yoga plans for every lifestyle. Choose from group live sessions, private 1-on-1 classes, prenatal yoga, and therapeutic yoga programs. Start your free demo today.",
    keywords:
      "yoga class pricing, yoga subscription plans, group yoga sessions, private yoga classes, prenatal yoga pricing, therapeutic yoga plan, online yoga membership",
    canonical: `${SITE.url}/pricing`,
  }),

  experts: buildPageHead({
    title: "Expert Yoga Instructors | Book Your Yoga Teacher",
    description:
      "Meet our world-class certified yoga instructors dedicated to your holistic well-being. Browse teachers specializing in prenatal yoga, therapeutic yoga, stress relief, and mindful living.",
    keywords:
      "certified yoga instructors, online yoga teachers, prenatal yoga specialist, therapeutic yoga expert, yoga for stress relief, holistic wellness coach, book yoga class",
    canonical: `${SITE.url}/experts`,
  }),

  demo: buildPageHead({
    title: "Book a Free Demo Yoga Class | Book Your Yoga Teacher",
    description:
      "Experience live yoga for free. Book your complimentary demo class with a certified instructor tailored to your wellness goals — prenatal, therapeutic, stress relief, and more.",
    keywords:
      "free yoga class, demo yoga session, try yoga online, yoga trial class, book yoga free, online yoga demo, prenatal yoga trial, therapeutic yoga free session",
    canonical: `${SITE.url}/demo`,
  }),
} as const;

// Global meta added by the root route (site-wide, not per-page).
export const ROOT_GLOBAL_META = [
  { name: "author" as const, content: SITE.name },
  { name: "robots" as const, content: "index, follow" },
  { property: "og:site_name", content: SITE.name },
  { property: "og:type", content: "website" },
  { name: "twitter:card" as const, content: "summary_large_image" },
] as const;

// Builder for dynamic expert profile pages.
export function buildExpertHead(instructor: {
  name: string;
  tagline?: string | null;
  specialty?: string[] | null;
  profileImageUrl?: string | null;
} | null | undefined) {
  if (!instructor) return {};
  const title = `${instructor.name} | Yoga Instructor | ${SITE.name}`;
  const description =
    instructor.tagline ??
    `Book a yoga session with ${instructor.name}, a certified instructor specializing in ${instructor.specialty?.join(", ") || "yoga"}.`;
  return buildPageHead({
    title,
    description,
    keywords: `${instructor.name}, yoga instructor, ${instructor.specialty?.join(", ")}, book yoga class, online yoga`,
    canonical: `${SITE.url}/experts/`,
    ogImage: instructor.profileImageUrl ?? undefined,
  });
}

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
      "Book live 1-on-1 yoga sessions with certified instructors. Prenatal yoga, therapeutic yoga, stress relief, flexibility, and more — from home.",
    keywords:
      "online yoga classes, book yoga teacher, live yoga sessions, prenatal yoga, therapeutic yoga, stress relief yoga, private yoga instructor, yoga for beginners, mindfulness meditation",
    canonical: `${SITE.url}/`,
  }),

  pricing: buildPageHead({
    title: "Yoga Class Plans & Pricing | Book Your Yoga Teacher",
    description:
      "Flexible yoga plans for every lifestyle. Choose from private 1-on-1 classes, prenatal yoga, and therapeutic yoga programs. Start your free demo today.",
    keywords:
      "yoga class pricing, yoga subscription plans, private yoga classes, prenatal yoga pricing, therapeutic yoga plan, online yoga membership",
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

  privacy: buildPageHead({
    title: "Privacy Policy | Book Your Yoga Teacher",
    description:
      "Learn how Book Your Yoga Teacher collects, uses, and protects your personal information. We are committed to your privacy and data security.",
    keywords:
      "privacy policy, data protection, personal information, yoga platform privacy, user data",
    canonical: `${SITE.url}/privacy`,
  }),

  terms: buildPageHead({
    title: "Terms of Service | Book Your Yoga Teacher",
    description:
      "Read the Terms of Service for Book Your Yoga Teacher. Understand your rights and responsibilities when using our platform.",
    keywords:
      "terms of service, terms and conditions, user agreement, yoga platform terms",
    canonical: `${SITE.url}/terms`,
  }),

  contact: buildPageHead({
    title: "Contact Us | Book Your Yoga Teacher",
    description:
      "Have a question or need support? Get in touch with the Book Your Yoga Teacher team. We're here to help with bookings, plans, and anything else.",
    keywords:
      "contact yoga teacher, support, yoga booking help, get in touch, customer service",
    canonical: `${SITE.url}/contact`,
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

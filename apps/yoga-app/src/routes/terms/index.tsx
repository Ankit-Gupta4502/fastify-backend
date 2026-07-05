import { createFileRoute } from "@tanstack/react-router";
import { PAGE_SEO } from "@/shared/lib/seo";
import { ScrollText } from "lucide-react";

export const Route = createFileRoute("/terms/")({
  head: () => PAGE_SEO.terms,
  component: TermsPage,
});

const sections = [
  {
    title: "Acceptance of Terms",
    body: `By creating an account or using any part of the Book Your Yoga Teacher platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.`,
  },
  {
    title: "Eligibility",
    body: `You must be at least 18 years old to create an account. By using our platform, you represent that you meet this requirement. Accounts created on behalf of minors must be managed by a parent or legal guardian.`,
  },
  {
    title: "Account Responsibilities",
    body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access. You are responsible for all activities that occur under your account.`,
  },
  {
    title: "Bookings & Sessions",
    body: `Sessions must be booked through the platform. Once booked, a session is considered confirmed. Rescheduling or cancellations must be made at least 24 hours before the scheduled session. Late cancellations may not be eligible for a refund or credit.`,
  },
  {
    title: "Payments & Refunds",
    body: `All payments are processed securely via Razorpay. Subscription fees are charged on a monthly basis. Refunds for unused sessions may be requested within 7 days of the billing date, at our discretion. One-time session fees are non-refundable after the session has taken place.`,
  },
  {
    title: "Instructor Conduct",
    body: `Instructors on our platform are independent professionals. Book Your Yoga Teacher facilitates the connection but is not responsible for the content or quality of individual sessions. If you experience an issue with an instructor, please contact our support team.`,
  },
  {
    title: "Prohibited Conduct",
    body: `You agree not to misuse the platform, including but not limited to: impersonating others, sharing your account credentials, recording sessions without consent, or using the platform for any unlawful purpose.`,
  },
  {
    title: "Intellectual Property",
    body: `All content on the platform — including logos, text, videos, and session materials — is the property of Book Your Yoga Teacher or its licensors. You may not reproduce or distribute this content without prior written permission.`,
  },
  {
    title: "Limitation of Liability",
    body: `To the fullest extent permitted by law, Book Your Yoga Teacher shall not be liable for indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you in the 3 months prior to the claim.`,
  },
  {
    title: "Termination",
    body: `We reserve the right to suspend or terminate your account if you violate these Terms. You may close your account at any time by contacting support. Upon termination, your access to sessions and data will cease.`,
  },
  {
    title: "Governing Law",
    body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi, India.`,
  },
  {
    title: "Contact",
    body: `For questions about these Terms, contact us at support@bookyouryogateacher.com or via WhatsApp at +91 79826 90162.`,
  },
];

function TermsPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[600px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-14 md:py-20 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/12 px-4 py-1.5 rounded-full">
            <ScrollText className="size-3 text-primary" />
            <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">Terms of Service</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
            Clear terms,{" "}
            <span className="font-doodle italic text-primary">no surprises</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Last updated: June 2025. Please read these terms carefully before using our platform.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <div key={s.title} className="group relative pl-6 border-l-2 border-border/50 hover:border-primary/40 transition-colors">
              <span className="absolute -left-3.5 top-0 size-6 rounded-full bg-background border border-border/60 group-hover:border-primary/40 flex items-center justify-center transition-colors">
                <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
              </span>
              <h2 className="text-lg font-bold mb-2">{s.title}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

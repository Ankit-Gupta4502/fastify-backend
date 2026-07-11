import { createFileRoute } from "@tanstack/react-router";
import { PAGE_SEO } from "@/shared/lib/seo";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/privacy/")({
  head: () => PAGE_SEO.privacy,
  component: PrivacyPage,
});

const sections = [
  {
    title: "Information We Collect",
    body: `When you create an account or book a session, we collect information you provide directly — such as your name, email address, phone number, and payment details. We also collect usage data (pages visited, session history) to improve your experience.`,
  },
  {
    title: "How We Use Your Information",
    body: `We use your information to operate and improve the platform, process bookings and payments, communicate with you about sessions and updates, and ensure the safety and security of our services. We do not sell your personal information to third parties.`,
  },
  {
    title: "Payment Data",
    body: `All payments are processed by Razorpay, a PCI-DSS-compliant payment gateway. We never store your card details on our servers. Razorpay's privacy policy governs how your payment information is handled during transactions.`,
  },
  {
    title: "Cookies & Tracking",
    body: `We use essential cookies to keep you signed in and remember your preferences. We may use analytics cookies to understand how visitors use our site. You can disable non-essential cookies in your browser settings at any time.`,
  },
  {
    title: "Data Sharing",
    body: `We share your information only with instructors you book sessions with (name, session details), and with trusted service providers who help us operate the platform (Razorpay, email services). All partners are bound by confidentiality agreements.`,
  },
  {
    title: "Data Retention",
    body: `We retain your account information for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting us at support@bookyouryogateacher.com.`,
  },
  {
    title: "Your Rights",
    body: `You have the right to access, correct, or delete your personal data. You may also opt out of marketing emails at any time using the unsubscribe link in any email we send. For any privacy-related requests, contact us at support@bookyouryogateacher.com.`,
  },
  {
    title: "Security",
    body: `We use industry-standard encryption (HTTPS/TLS) to protect data in transit. Access to personal data is restricted to employees and contractors who need it to operate our services.`,
  },
  {
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. When we do, we will notify you via email or a prominent notice on the site. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "Contact",
    body: `If you have questions about this Privacy Policy, please contact us at support@bookyouryogateacher.com or via WhatsApp at +91 79826 90162.`,
  },
];

function PrivacyPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[600px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-14 md:py-20 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/12 px-4 py-1.5 rounded-full">
            <Shield className="size-3 text-primary" />
            <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">Privacy Policy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
            Your privacy,{" "}
            <span className="font-doodle italic text-primary">our promise</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Last updated: June 2025. This policy explains what data we collect, how we use it, and the choices you have.
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

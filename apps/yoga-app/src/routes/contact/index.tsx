import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { PAGE_SEO } from "@/shared/lib/seo";
import { ContactChannels, ContactForm } from "@/features/contact";

export const Route = createFileRoute("/contact/")({
  head: () => PAGE_SEO.contact,
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[600px] bg-primary/5 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/3 right-0 size-[400px] bg-sky-500/4 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 md:py-20 space-y-14">
        <div className="text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/12 px-4 py-1.5 rounded-full">
            <Mail className="size-3 text-primary" />
            <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">Get in Touch</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
            We'd love to{" "}
            <span className="font-doodle italic text-primary">hear from you</span>
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Questions about bookings, plans, or anything else — drop us a message and we'll get back to you within one business day.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_1.4fr] gap-10 items-start">
          <ContactChannels />

          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-sky-500/3 pointer-events-none" />
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

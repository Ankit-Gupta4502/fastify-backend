import { createFileRoute } from "@tanstack/react-router";
import { PAGE_SEO } from "@/shared/lib/seo";
import { useState } from "react";
import { Mail, MessageCircle, Send, CheckCircle2, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

export const Route = createFileRoute("/contact/")({
  head: () => PAGE_SEO.contact,
  component: ContactPage,
});

const channels = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "+91 79826 90162",
    href: "https://wa.me/917982690162",
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
  },
  {
    icon: Mail,
    label: "Email",
    value: "support@bookyouryogateacher.com",
    href: "mailto:support@bookyouryogateacher.com",
    color: "text-primary bg-primary/8 border-primary/15",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@bookyouryogateacher",
    href: "https://www.instagram.com/bookyouryogateacher/",
    color: "text-pink-600 bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20",
  },
  {
    icon: Youtube,
    label: "YouTube",
    value: "@Bookyouryogateacher",
    href: "https://www.youtube.com/@Bookyouryogateacher",
    color: "text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20",
  },
];

type FormState = { name: string; email: string; subject: string; message: string };
const EMPTY: FormState = { name: "", email: "", subject: "", message: "" };

function ContactPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[600px] bg-primary/5 blur-[130px] rounded-full" />
        <div className="absolute bottom-1/3 right-0 size-[400px] bg-sky-500/4 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 md:py-20 space-y-14">
        {/* Header */}
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
          {/* Contact channels */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground/70 uppercase tracking-widest">Reach us directly</p>
            <div className="space-y-3">
              {channels.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] hover:shadow-md",
                      c.color
                    )}
                  >
                    <div className="size-9 rounded-xl flex items-center justify-center bg-white/60 dark:bg-white/5 shrink-0">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{c.label}</p>
                      <p className="text-sm font-semibold truncate">{c.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              For the fastest response, reach us on WhatsApp or email. We typically reply within a few hours during business hours (Mon–Sat, 9 am–7 pm IST).
            </p>
          </div>

          {/* Contact form */}
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-7 md:p-8">
            <div className="absolute inset-0 bg-linear-to-br from-primary/3 via-transparent to-sky-500/3 pointer-events-none" />

            {submitted ? (
              <div className="relative flex flex-col items-center justify-center gap-5 py-10 text-center">
                <div className="size-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Message received!</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Thanks for reaching out, {form.name.split(" ")[0]}. We'll get back to you at{" "}
                    <span className="font-semibold text-foreground">{form.email}</span> within one business day.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full mt-2"
                  onClick={() => { setForm(EMPTY); setSubmitted(false); }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={set("name")}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={set("email")}
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={set("subject")}
                    required
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us what's on your mind..."
                    value={form.message}
                    onChange={set("message")}
                    required
                    rows={5}
                    className="rounded-xl resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
                >
                  {loading ? (
                    <span className="animate-pulse">Sending…</span>
                  ) : (
                    <>
                      Send message
                      <Send className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

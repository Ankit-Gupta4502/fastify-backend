import { ShieldCheck, CreditCard } from "lucide-react";
import { trustSignals } from "./pricing-config";

export function TrustSection() {
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="relative overflow-hidden rounded-4xl border border-border/40 bg-card/40 backdrop-blur-sm p-7 md:p-10">
        <div className="absolute inset-0 bg-linear-to-br from-primary/4 via-transparent to-sky-500/4 pointer-events-none" />
        <div className="absolute -top-20 -right-20 size-64 bg-primary/6 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 size-64 bg-sky-500/6 blur-3xl rounded-full pointer-events-none" />

        <div className="relative space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="size-16 rounded-3xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight">Safe & Secure Payments</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                Your payment is processed end-to-end by Razorpay — one of India's most trusted payment gateways. We never see or store your card details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {trustSignals.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-background/60 border border-border/40 text-center hover:border-primary/20 transition-colors">
                <div className="size-9 rounded-xl bg-primary/8 flex items-center justify-center">
                  <Icon className="size-4 text-primary" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground leading-tight">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border/30">
            <CreditCard className="size-4 text-muted-foreground/50 shrink-0" />
            <p className="text-xs text-muted-foreground/60">
              Powered by <span className="font-semibold text-muted-foreground">Razorpay</span> · Accepts Visa, Mastercard, RuPay, UPI, Net Banking &amp; more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Zap } from "lucide-react";

export function PricingHero() {
  return (
    <div className="text-center max-w-2xl mx-auto space-y-6 px-4 animate-doodle-fade-up">
      <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/12 px-4 py-1.5 rounded-full">
        <Zap className="size-3 fill-primary text-primary" />
        <span className="text-[11px] font-bold tracking-[0.3em] text-primary uppercase">Simple Pricing</span>
      </div>
      <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-[1.05]">
        Invest in your
        <br />
        <span className="font-doodle italic doodle-underline text-primary">inner peace</span>
      </h1>
      <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
        Four honest plans. No hidden fees. No first-month discounts. Just the same fair price, always.
      </p>
    </div>
  );
}

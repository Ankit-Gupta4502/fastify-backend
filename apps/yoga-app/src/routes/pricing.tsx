import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const tiers = [
  {
    name: "Aspirant",
    price: "$0",
    description: "Perfect for those beginning their mindfulness journey.",
    features: [
      "Access to community circles",
      "Basic wellness tracking",
      "3 guided meditations/week",
      "Mobile app access",
    ],
    buttonText: "Start Free",
    link: "/login",
    popular: false,
  },
  {
    name: "Practitioner",
    price: "$19",
    description: "Enhanced tools for a deeper, daily mindfulness practice.",
    features: [
      "Everything in Aspirant",
      "Unlimited guided meditations",
      "Advanced stress analytics",
      "Priority class booking",
      "Custom practice goals",
    ],
    buttonText: "Get Started",
    link: "/login",
    popular: true,
  },
  {
    name: "Studio",
    price: "$49",
    description: "Professional tools for instructors and studio owners.",
    features: [
      "Everything in Practitioner",
      "Client management system",
      "Class scheduling & booking",
      "Financial reporting",
      "Instructor sub-accounts",
    ],
    buttonText: "Contact Sales",
    link: "/login",
    popular: false,
  },
];

const faqs = [
  {
    q: "Can I change plans later?",
    a: "Yes, you can upgrade or downgrade your plan at any time from your dashboard settings."
  },
  {
    q: "Is there a student discount?",
    a: "We offer a 20% discount for verified students. Contact our support team to apply."
  },
  {
    q: "Do you offer a free trial for paid plans?",
    a: "Every new account starts with a 14-day trial of the Practitioner features."
  }
];

function PricingPage() {
  return (
    <div className="py-12 md:py-20 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold tracking-[0.3em] text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
          Pricing
        </span>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground">
          Invest in your <span className="italic text-primary">inner peace</span>
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Choose a plan that matches your rhythm. No hidden fees, just simple tools for a balanced life.
        </p>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {tiers.map((tier) => (
          <Card 
            key={tier.name} 
            className={cn(
              "relative border-none shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full rounded-4xl",
              tier.popular ? "bg-card scale-105 z-10 ring-2 ring-primary/20" : "bg-card/50 backdrop-blur-sm"
            )}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                Most Popular
              </div>
            )}
            
            <CardHeader className="pt-10 pb-6 text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">{tier.name}</CardTitle>
              <CardDescription className="pt-2">{tier.description}</CardDescription>
              <div className="pt-6 flex items-baseline justify-center gap-1">
                <span className="text-5xl font-serif font-bold">{tier.price}</span>
                <span className="text-muted-foreground font-medium">/mo</span>
              </div>
            </CardHeader>

            <CardContent className="grow space-y-4 px-8">
              {tier.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground/80">{feature}</span>
                </div>
              ))}
            </CardContent>

            <CardFooter className="pb-10 px-8">
              <Button 
                asChild 
                className={cn(
                  "w-full rounded-2xl py-6 font-bold shadow-lg transition-all",
                  tier.popular ? "bg-primary shadow-primary/20 hover:shadow-primary/30" : "variant-outline"
                )}
                variant={tier.popular ? "default" : "outline"}
              >
                <Link to={tier.link}>{tier.buttonText}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <HelpCircle className="size-10 text-primary/40 mx-auto mb-2" />
          <h2 className="text-3xl font-serif font-bold">Frequently Asked Questions</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, i) => (
            <div key={i} className="space-y-3">
              <h4 className="font-bold text-lg text-foreground">{faq.q}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support Card */}
      <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-secondary/30 border border-border/50 p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
        <div className="relative z-10">
          <Shield className="size-10 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold">Safe & Secure</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            All payments are encrypted and processed via Stripe. We never store your credit card information.
          </p>
        </div>
        <div className="absolute -bottom-24 -right-24 size-64 bg-primary/5 blur-3xl rounded-full" />
      </div>
    </div>
  );
}

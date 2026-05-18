import { Shield, Sparkles } from "lucide-react";

export function SecureFooter() {
  return (
    <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-secondary/30 border border-border/50 p-8 md:p-12 text-center space-y-4 relative overflow-hidden">
      <div className="relative z-10">
        <Shield className="size-10 text-primary mx-auto mb-3" />
        <h3 className="text-2xl font-bold">Razorpay-secured payments</h3>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          All transactions are encrypted end-to-end. Cards never touch our servers — we verify the
          signed payment receipt instead.
        </p>
        <div className="flex items-center justify-center gap-2 pt-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          PCI-DSS compliant
        </div>
      </div>
      <div className="absolute -bottom-24 -right-24 size-64 bg-primary/5 blur-3xl rounded-full" />
    </div>
  );
}

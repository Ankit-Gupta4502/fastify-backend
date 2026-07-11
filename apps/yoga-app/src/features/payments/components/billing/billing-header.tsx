export function BillingHeader() {
  return (
    <div className="space-y-3 max-w-2xl">
      <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase border border-primary/20 px-3 py-1.5 rounded-md inline-block">
        Billing
      </span>
      <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight">
        Pick the rhythm that <span className="italic text-primary">moves you</span>
      </h1>
      <p className="text-muted-foreground">
        Subscribe securely via Razorpay. Change plans whenever — no penalties.
      </p>
    </div>
  );
}

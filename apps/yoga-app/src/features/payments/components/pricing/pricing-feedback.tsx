interface PricingFeedbackProps {
  error: string | null;
  success: string | null;
}

export function PricingFeedback({ error, success }: PricingFeedbackProps) {
  if (!error && !success) return null;
  return (
    <div className="max-w-lg mx-auto px-4">
      {error && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive px-6 py-4 text-sm text-center">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 px-6 py-4 text-sm text-center font-medium">
          {success}
        </div>
      )}
    </div>
  );
}

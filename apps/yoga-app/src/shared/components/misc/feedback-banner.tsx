import { cn } from "@/shared/lib/utils";

interface FeedbackBannerProps {
  error?: string | null;
  success?: string | null;
}

export function FeedbackBanner({ error, success }: FeedbackBannerProps) {
  if (!error && !success) return null;

  return (
    <div
      className={cn(
        "rounded-2xl p-4 text-sm",
        error
          ? "bg-destructive/5 border border-destructive/40 text-destructive"
          : "bg-emerald-500/5 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400",
      )}
    >
      {error ?? success}
    </div>
  );
}

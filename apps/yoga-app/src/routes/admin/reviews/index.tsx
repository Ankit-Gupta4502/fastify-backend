import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, Plus, Pencil, Trash2, X } from "lucide-react";
import { createReviewSchema, type CreateReviewBody, type AdminReview } from "@yoga-app/shared";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  useAdminReviews,
  useCreateReview,
  useUpdateReview,
  useDeleteReview,
} from "@/hooks/use-reviews";

export const Route = createFileRoute("/admin/reviews/")({
  component: AdminReviewsPage,
});

// ── Star picker ────────────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(s)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              "size-6 transition-colors",
              s <= (hovered || value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

// ── Review form dialog ─────────────────────────────────────────────────────────

interface ReviewFormProps {
  initial?: AdminReview;
  onClose: () => void;
}

function ReviewFormDialog({ initial, onClose }: ReviewFormProps) {
  const create = useCreateReview();
  const update = useUpdateReview();
  const isPending = create.isPending || update.isPending;

  const form = useForm<CreateReviewBody>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      reviewerName: initial?.reviewerName ?? "",
      rating: initial?.rating ?? 5,
      comment: initial?.comment ?? "",
      videoUrl: initial?.videoUrl ?? "",
    },
  });

  const rating = form.watch("rating");

  async function onSubmit(values: CreateReviewBody) {
    if (initial) {
      await update.mutateAsync({ id: initial.id, body: values });
    } else {
      await create.mutateAsync(values);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border/60 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <p className="font-semibold text-sm">{initial ? "Edit Review" : "Add Review"}</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Reviewer name */}
          <FormField
            label="Reviewer name"
            error={form.formState.errors.reviewerName?.message}
          >
            <Input
              placeholder="e.g. Sarah Chen"
              className={cn("h-10", form.formState.errors.reviewerName && "border-destructive")}
              {...form.register("reviewerName")}
            />
          </FormField>

          {/* Rating */}
          <FormField label="Rating" error={form.formState.errors.rating?.message}>
            <StarPicker value={rating} onChange={(v) => form.setValue("rating", v, { shouldValidate: true })} />
          </FormField>

          {/* Comment */}
          <FormField label="Comment" error={form.formState.errors.comment?.message}>
            <textarea
              rows={4}
              placeholder="Share the reviewer's experience…"
              className={cn(
                "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring resize-none",
                form.formState.errors.comment && "border-destructive",
              )}
              {...form.register("comment")}
            />
          </FormField>

          {/* Video URL */}
          <FormField label="Video URL (optional)" error={form.formState.errors.videoUrl?.message}>
            <Input
              placeholder="https://…"
              className="h-10"
              {...form.register("videoUrl")}
            />
          </FormField>

          {/* Error feedback */}
          {(create.error || update.error) && (
            <p className="text-xs text-destructive">
              {(create.error ?? update.error)?.message ?? "Something went wrong"}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={isPending}>
              {isPending ? "Saving…" : initial ? "Save Changes" : "Add Review"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm ─────────────────────────────────────────────────────────────

function DeleteConfirm({ review, onClose }: { review: AdminReview; onClose: () => void }) {
  const del = useDeleteReview();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border/60 shadow-2xl p-6 space-y-4">
        <p className="font-semibold text-sm">Delete review?</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          "{review.comment.slice(0, 80)}{review.comment.length > 80 ? "…" : ""}" by{" "}
          <span className="font-medium text-foreground">{review.reviewerName}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose} disabled={del.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="flex-1 rounded-xl"
            disabled={del.isPending}
            onClick={async () => { await del.mutateAsync(review.id); onClose(); }}
          >
            {del.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Stars display ──────────────────────────────────────────────────────────────

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn("size-3", s <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
        />
      ))}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

function AdminReviewsPage() {
  const { data, isLoading, error } = useAdminReviews();
  const [dialogMode, setDialogMode] = useState<null | "create" | AdminReview>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminReview | null>(null);

  const reviews = data?.data ?? [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <SectionHeader
            eyebrow="Admin"
            title="Reviews"
            description="Manage testimonials shown on the home page."
          />
          <Button
            className="rounded-xl gap-2 shrink-0"
            onClick={() => setDialogMode("create")}
          >
            <Plus className="size-4" />
            Add Review
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Reviewer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Rating</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground hidden md:table-cell">Comment</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="px-5 py-4"><Skeleton className="h-4 w-28 rounded-full" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-20 rounded-full" /></td>
                    <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-48 rounded-full" /></td>
                    <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-20 rounded-full" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-7 w-16 rounded-lg ml-auto" /></td>
                  </tr>
                ))
              )}

              {error && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-destructive">
                    Failed to load reviews.
                  </td>
                </tr>
              )}

              {!isLoading && !error && reviews.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No reviews yet. Add the first one.
                  </td>
                </tr>
              )}

              {!isLoading && reviews.map((r) => (
                <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-4 font-medium">{r.reviewerName}</td>
                  <td className="px-5 py-4">
                    <StarDisplay rating={r.rating} />
                  </td>
                  <td className="px-5 py-4 text-muted-foreground hidden md:table-cell max-w-xs">
                    <span className="line-clamp-2 text-xs leading-relaxed">{r.comment}</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground text-xs hidden lg:table-cell whitespace-nowrap">
                    {r.createdAt}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDialogMode(r)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(r)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {dialogMode && (
        <ReviewFormDialog
          initial={dialogMode === "create" ? undefined : dialogMode}
          onClose={() => setDialogMode(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm review={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────────

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className={cn("block text-xs font-medium", error && "text-destructive")}>{label}</label>
      {children}
      {error && <p className="text-[10px] text-destructive font-medium">{error}</p>}
    </div>
  );
}

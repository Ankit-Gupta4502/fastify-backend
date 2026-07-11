import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AdminInstructor } from "@yoga-app/shared";
import { useUpdateInstructorStats } from "@/features/admin/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ApiRequestError } from "@/lib/http";

const statsSchema = z.object({
  rating: z.number().min(1, "Min 1").max(5, "Max 5"),
  studentsGuided: z.number().int().min(0, "Min 0"),
});

type StatsForm = z.infer<typeof statsSchema>;

interface InstructorStatsDialogProps {
  instructor: AdminInstructor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstructorStatsDialog({ instructor, open, onOpenChange }: InstructorStatsDialogProps) {
  const updateStats = useUpdateInstructorStats();

  const form = useForm<StatsForm>({
    resolver: zodResolver(statsSchema),
    defaultValues: { rating: 5, studentsGuided: 0 },
  });

  useEffect(() => {
    if (instructor) {
      form.reset({ rating: instructor.rating, studentsGuided: instructor.studentsGuided });
    }
  }, [instructor, form]);

  async function onSubmit(values: StatsForm) {
    if (!instructor) return;
    await updateStats.mutateAsync({ id: instructor.id, body: values });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Profile Stats</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <p className="text-xs text-muted-foreground">
            Shown on {instructor?.name}'s public profile page.
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Rating (1–5)</Label>
            <Input
              type="number"
              step="0.1"
              min="1"
              max="5"
              {...form.register("rating", { valueAsNumber: true })}
            />
            {form.formState.errors.rating && (
              <p className="text-[10px] text-destructive">{form.formState.errors.rating.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Students guided</Label>
            <Input
              type="number"
              step="1"
              min="0"
              {...form.register("studentsGuided", { valueAsNumber: true })}
            />
            {form.formState.errors.studentsGuided && (
              <p className="text-[10px] text-destructive">{form.formState.errors.studentsGuided.message}</p>
            )}
          </div>

          {updateStats.isError && (
            <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">
              {updateStats.error instanceof ApiRequestError || updateStats.error instanceof Error
                ? updateStats.error.message
                : "Failed to update stats"}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateStats.isPending}>
              {updateStats.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

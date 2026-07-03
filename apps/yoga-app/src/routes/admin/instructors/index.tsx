import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import { useAdminInstructors, useCreateInstructor } from "@/hooks/use-admin";
import { InstructorsTable } from "../-components/InstructorsTable";
import { SectionHeader } from "@/components/shared/SectionHeader";
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

export const Route = createFileRoute("/admin/instructors/")({
  component: AdminInstructorsPage,
});

const createInstructorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type CreateInstructorForm = z.infer<typeof createInstructorSchema>;

function AdminInstructorsPage() {
  const { data, isLoading, error } = useAdminInstructors();
  const instructors = data?.data ?? [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const createInstructor = useCreateInstructor();

  const form = useForm<CreateInstructorForm>({
    resolver: zodResolver(createInstructorSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: CreateInstructorForm) {
    setFeedback(null);
    try {
      await createInstructor.mutateAsync(values);
      form.reset();
      setDialogOpen(false);
    } catch (err) {
      setFeedback(
        err instanceof ApiRequestError || err instanceof Error
          ? err.message
          : "Failed to create instructor",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <SectionHeader
          eyebrow="Admin"
          title="Instructors"
          description="Manage instructors, approve accounts, and set listing priority."
        />
        <Button
          className="gap-2 shrink-0"
          onClick={() => {
            form.reset();
            setFeedback(null);
            setDialogOpen(true);
          }}
        >
          <UserPlus className="size-4" />
          Add Instructor
        </Button>
      </div>

      <InstructorsTable instructors={instructors} isLoading={isLoading} error={error} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Instructor</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Full name</Label>
              <Input placeholder="Priya Sharma" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-[10px] text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Email address</Label>
              <Input type="email" placeholder="instructor@example.com" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-[10px] text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Temporary password</Label>
              <Input type="password" placeholder="At least 8 characters" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-[10px] text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            {feedback && (
              <p className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2">
                {feedback}
              </p>
            )}

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createInstructor.isPending}>
                {createInstructor.isPending ? "Creating…" : "Create Instructor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import type { CreateContactQueryBody } from "@yoga-app/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import { contactFormOptions } from "@/features/contact/schemas";
import { useSubmitContactQuery } from "@/features/contact/hooks";

export function ContactForm() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateContactQueryBody>(contactFormOptions);
  const submitContact = useSubmitContactQuery();
  const [submittedTo, setSubmittedTo] = useState<{ name: string; email: string } | null>(null);

  const onSubmit = async (values: CreateContactQueryBody) => {
    await submitContact.mutateAsync(values);
    setSubmittedTo({ name: values.name, email: values.email });
  };

  if (submittedTo) {
    return (
      <div className="relative flex flex-col items-center justify-center gap-5 py-10 text-center">
        <div className="size-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Message received!</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Thanks for reaching out, {submittedTo.name.split(" ")[0]}. We'll get back to you at{" "}
            <span className="font-semibold text-foreground">{submittedTo.email}</span> within one business day.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full mt-2"
          onClick={() => {
            reset();
            setSubmittedTo(null);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            className={cn("rounded-xl", errors.name && "border-destructive focus-visible:ring-destructive/20")}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@email.com"
            className={cn("rounded-xl", errors.email && "border-destructive focus-visible:ring-destructive/20")}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="What's this about?"
          className={cn("rounded-xl", errors.subject && "border-destructive focus-visible:ring-destructive/20")}
          {...register("subject")}
        />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us what's on your mind..."
          rows={5}
          className={cn("rounded-xl resize-none", errors.message && "border-destructive focus-visible:ring-destructive/20")}
          {...register("message")}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={submitContact.isPending}
        className="w-full rounded-full gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
      >
        {submitContact.isPending ? (
          <span className="animate-pulse">Sending…</span>
        ) : (
          <>
            Send message
            <Send className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}

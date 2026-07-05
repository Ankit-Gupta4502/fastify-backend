import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstructorDetail } from "./context";
import { useMyPlan } from "@/features/payments/hooks/use-plans";
import { useNavigate } from "@tanstack/react-router";

export function Cta() {
  const { instructor } = useInstructorDetail();
  const firstName = instructor.name.split(" ")[0];
  const { data: myPlan } = useMyPlan();
  const navigate = useNavigate();

  function handleBook() {
    if (!myPlan?.data?.length) {
      navigate({ to: "/pricing" });
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-8 space-y-5 sketch-border-sm">
      <div className="absolute -right-10 -top-10 size-40 bg-primary/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 size-28 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
      <div className="relative space-y-2">
        <p className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">Start Your Journey</p>
        <h3 className="text-2xl font-serif font-bold">
          Ready to begin with{" "}
          <span className="font-doodle italic text-primary doodle-underline">{firstName}</span>?
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
          Book your first session and discover the transformative power of personalized instruction.
        </p>
      </div>
      <Button onClick={handleBook} className="relative rounded-2xl gap-2 font-bold shadow-lg shadow-primary/20 px-6">
        <Calendar className="size-4" />
        Book now
      </Button>
    </div>
  );
}

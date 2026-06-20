import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Field({
  label,
  error,
  labelRight,
  children,
}: {
  label: string;
  error?: string;
  labelRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className={cn("text-xs font-medium", error && "text-destructive")}>{label}</Label>
        {labelRight}
      </div>
      {children}
      {error && <p className="text-[10px] font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function SubmitButton({
  loading,
  label,
  loadingLabel,
}: {
  loading: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <div className="relative group pt-1">
      <div className="doodle-glow-ring" />
      <Button
        type="submit"
        className="relative w-full h-11 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] transition-all duration-300"
        disabled={loading}
      >
        {loading ? loadingLabel : label}
        {!loading && <MoveRight className="ml-2 size-4" />}
      </Button>
    </div>
  );
}

import { Building2, User } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type AccountType = "individual" | "company";

interface AccountTypeToggleProps {
  value: AccountType;
  onChange: (next: AccountType) => void;
}

export function AccountTypeToggle({ value, onChange }: AccountTypeToggleProps) {
  return (
    <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Account type">
      {(
        [
          { type: "individual" as const, label: "Individual", Icon: User },
          { type: "company" as const, label: "Company", Icon: Building2 },
        ]
      ).map(({ type, label, Icon }) => (
        <button
          key={type}
          type="button"
          role="radio"
          aria-checked={value === type}
          onClick={() => onChange(type)}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition-all",
            value === type
              ? "border-primary/40 bg-primary/8 text-primary"
              : "border-border/60 text-muted-foreground hover:bg-muted/30",
          )}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

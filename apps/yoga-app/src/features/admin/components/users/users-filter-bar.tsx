import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PLAN_COPY } from "@/features/payments/utils/plan-copy";

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "instructor", label: "Instructor" },
  { value: "admin", label: "Admin" },
];

const PLAN_OPTIONS = Object.entries(PLAN_COPY).map(([value, copy]) => ({
  value,
  label: copy.title,
}));

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending_payment", label: "Pending payment" },
];

interface UsersFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: string;
  onRoleChange: (value: string) => void;
  plan: string;
  onPlanChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  hasFilters: boolean;
  onClear: () => void;
}

export function UsersFilterBar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  plan,
  onPlanChange,
  status,
  onStatusChange,
  hasFilters,
  onClear,
}: UsersFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-48 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="All roles" />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={plan} onValueChange={onPlanChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="All plans" />
        </SelectTrigger>
        <SelectContent>
          {PLAN_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground gap-1.5">
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  );
}

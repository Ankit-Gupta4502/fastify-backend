import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useAdminUsers } from "@/features/admin/hooks/use-admin";
import { UsersTable } from "@/features/admin/components/users-table";
import { SectionHeader } from "@/shared/components/misc/section-header";
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

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
});

const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "instructor", label: "Instructor" },
  { value: "admin", label: "Admin" },
];

const PLAN_OPTIONS = Object.entries(PLAN_COPY).map(([value, copy]) => ({
  value,
  label: copy.title,
}));

function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [plan, setPlan] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const filters = {
    search: debouncedSearch || undefined,
    role: role || undefined,
    plan: plan || undefined,
  };
  const hasFilters = !!(debouncedSearch || role || plan);

  const { data, isLoading, error } = useAdminUsers(filters);
  const users = data?.data ?? [];

  function clearFilters() {
    setSearch("");
    setRole("");
    setPlan("");
  }

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Admin" title="Users" description="All registered accounts." />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={plan} onValueChange={setPlan}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All plans" />
          </SelectTrigger>
          <SelectContent>
            {PLAN_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground gap-1.5">
            <X className="size-3.5" />
            Clear
          </Button>
        )}
      </div>

      <UsersTable users={users} isLoading={isLoading} error={error} search={debouncedSearch} />
    </div>
  );
}

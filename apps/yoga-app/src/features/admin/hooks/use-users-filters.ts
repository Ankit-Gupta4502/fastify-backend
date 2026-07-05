import { useState } from "react";
import { useDebounce } from "@/shared/hooks";

export function useUsersFilters() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const filters = {
    search: debouncedSearch || undefined,
    role: role || undefined,
    plan: plan || undefined,
    status: status || undefined,
  };
  const hasFilters = !!(debouncedSearch || role || plan || status);

  function clearFilters() {
    setSearch("");
    setRole("");
    setPlan("");
    setStatus("");
  }

  return {
    search,
    setSearch,
    role,
    setRole,
    plan,
    setPlan,
    status,
    setStatus,
    debouncedSearch,
    filters,
    hasFilters,
    clearFilters,
  };
}

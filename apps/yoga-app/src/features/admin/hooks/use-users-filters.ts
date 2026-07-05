import { useState } from "react";
import { useDebounce } from "@/shared/hooks";

const PAGE_SIZE = 20;

export function useUsersFilters() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 350);

  function withPageReset<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const filters = {
    search: debouncedSearch || undefined,
    role: role || undefined,
    plan: plan || undefined,
    status: status || undefined,
    page,
    pageSize: PAGE_SIZE,
  };
  const hasFilters = !!(debouncedSearch || role || plan || status);

  function clearFilters() {
    setSearch("");
    setRole("");
    setPlan("");
    setStatus("");
    setPage(1);
  }

  return {
    search,
    setSearch: withPageReset(setSearch),
    role,
    setRole: withPageReset(setRole),
    plan,
    setPlan: withPageReset(setPlan),
    status,
    setStatus: withPageReset(setStatus),
    debouncedSearch,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    filters,
    hasFilters,
    clearFilters,
  };
}

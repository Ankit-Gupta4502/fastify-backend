import { Search, Video, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/lib/utils";
import type { ScheduleFiltersState } from "@/features/instructor/hooks/use-schedule-filters";

interface ScheduleFiltersProps {
  filters: ScheduleFiltersState;
  setFilter: <K extends keyof ScheduleFiltersState>(key: K, value: ScheduleFiltersState[K]) => void;
  hasActiveFilters: boolean;
  onReset: () => void;
  resultCount: number;
}

export function ScheduleFilters({ filters, setFilter, hasActiveFilters, onReset, resultCount }: ScheduleFiltersProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search by type, status, or admin note…"
            className="pl-9 rounded-xl"
          />
        </div>

        <Select value={filters.type} onValueChange={(v) => setFilter("type", v as ScheduleFiltersState["type"])}>
          <SelectTrigger className="rounded-xl w-full md:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="group">Group</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => setFilter("status", v as ScheduleFiltersState["status"])}>
          <SelectTrigger className="rounded-xl w-full md:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="ended">Ended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilter("dateFrom", e.target.value)}
            className="rounded-xl w-full md:w-40"
            aria-label="From date"
          />
          <span className="text-xs text-muted-foreground shrink-0">to</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilter("dateTo", e.target.value)}
            className="rounded-xl w-full md:w-40"
            aria-label="To date"
          />
        </div>

        <button
          type="button"
          onClick={() => setFilter("joinableOnly", !filters.joinableOnly)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors shrink-0",
            filters.joinableOnly
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          <Video className="size-3.5" />
          Joinable now
        </button>

        <div className="flex-1" />

        <p className="text-xs text-muted-foreground">
          {resultCount} session{resultCount === 1 ? "" : "s"}
        </p>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground rounded-full" onClick={onReset}>
            <X className="size-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}

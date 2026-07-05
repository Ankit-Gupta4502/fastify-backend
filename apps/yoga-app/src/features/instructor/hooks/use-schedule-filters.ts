import { useMemo, useState } from "react";
import type { InstructorScheduleRoom, RoomStatus, RoomType } from "@yoga-app/shared";

export type RoomTypeFilter = "all" | RoomType;
export type RoomStatusFilter = "all" | RoomStatus;

export interface ScheduleFiltersState {
  search: string;
  type: RoomTypeFilter;
  status: RoomStatusFilter;
  dateFrom: string; // yyyy-mm-dd
  dateTo: string; // yyyy-mm-dd
  joinableOnly: boolean;
}

const EMPTY_FILTERS: ScheduleFiltersState = {
  search: "",
  type: "all",
  status: "all",
  dateFrom: "",
  dateTo: "",
  joinableOnly: false,
};

export function useScheduleFilters(rooms: InstructorScheduleRoom[]) {
  const [filters, setFilters] = useState<ScheduleFiltersState>(EMPTY_FILTERS);

  function setFilter<K extends keyof ScheduleFiltersState>(key: K, value: ScheduleFiltersState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
  }

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.status !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.joinableOnly;

  const filteredRooms = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const from = filters.dateFrom ? new Date(`${filters.dateFrom}T00:00:00`) : null;
    const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59`) : null;

    return rooms.filter((room) => {
      if (filters.type !== "all" && room.type !== filters.type) return false;
      if (filters.status !== "all" && room.status !== filters.status) return false;
      if (filters.joinableOnly && !room.canJoinLive) return false;

      const start = new Date(room.scheduledStartUtc);
      if (from && start < from) return false;
      if (to && start > to) return false;

      if (query) {
        const haystack = [room.type, room.status, room.scheduledStart, room.adminNote ?? ""]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [rooms, filters]);

  return { filters, setFilter, resetFilters, hasActiveFilters, filteredRooms };
}

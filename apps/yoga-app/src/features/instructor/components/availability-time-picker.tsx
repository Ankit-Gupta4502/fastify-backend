import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Clock3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/shared/lib/utils";

const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
  const hours = Math.floor(index / 4);
  const minutes = (index % 4) * 15;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const period = hours < 12 ? "AM" : "PM";
  const displayHours = hours % 12 || 12;

  return { value, label: `${displayHours}:${String(minutes).padStart(2, "0")} ${period}` };
});

interface AvailabilityTimePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
}

export function AvailabilityTimePicker({
  value,
  onValueChange,
  ariaLabel,
}: AvailabilityTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedItemRef = useRef<HTMLButtonElement>(null);

  const selectedOption = TIME_OPTIONS.find((option) => option.value === value);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return TIME_OPTIONS;
    return TIME_OPTIONS.filter((option) =>
      option.label.toLowerCase().replace(/\s+/g, "").includes(query.replace(/\s+/g, ""))
    );
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      return;
    }
    const frame = requestAnimationFrame(() => {
      selectedItemRef.current?.scrollIntoView({ block: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={ariaLabel}
          className="w-36 justify-start gap-2 rounded-xl font-normal"
        >
          <Clock3 className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{selectedOption?.label ?? "Select time"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 rounded-xl p-0" align="start">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search time"
            className="h-7 border-0 p-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matching time
            </p>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  ref={isSelected ? selectedItemRef : undefined}
                  type="button"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent/60 font-medium text-accent-foreground"
                  )}
                >
                  {option.label}
                  {isSelected && <Check className="size-4" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

import { useRef, useState, useEffect, useMemo } from "react";
import type { AdminInstructor } from "@yoga-app/shared";
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Check } from "lucide-react";

interface InstructorComboboxProps {
  instructors: AdminInstructor[];
  value: string;
  onChange: (id: string) => void;
}

export function InstructorCombobox({ instructors, value, onChange }: InstructorComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = instructors.find((i) => i.id === value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return instructors;
    return instructors.filter((i) => i.name.toLowerCase().includes(q));
  }, [search, instructors]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm",
          "hover:bg-muted/40 transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
          !selected && "text-muted-foreground",
        )}
      >
        <span className="truncate">{selected ? selected.name : "Select an instructor…"}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground flex-none transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-2.5 py-1.5">
              <Search className="size-3.5 text-muted-foreground flex-none" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instructor…"
                className="flex-1 min-w-0 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="max-h-44 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-center text-muted-foreground">
                No instructors found
              </p>
            ) : (
              filtered.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => {
                    onChange(i.id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors text-left",
                    "hover:bg-muted/50",
                    value === i.id && "bg-primary/10 text-primary",
                  )}
                >
                  <span className="flex-1 truncate text-xs">{i.name}</span>
                  {value === i.id && <Check className="size-3.5 flex-none" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

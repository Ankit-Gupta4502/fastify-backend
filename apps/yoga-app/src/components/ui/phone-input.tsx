import {
  usePhoneInput,
  defaultCountries,
  parseCountry,
  type CountryIso2,
} from "react-international-phone";
import { useRef, useState, useEffect, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";

function isoToFlag(iso2: string) {
  return iso2
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) + 127397));
}

const PARSED_COUNTRIES = defaultCountries.map((c) => parseCountry(c));

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  error?: boolean;
  defaultCountry?: CountryIso2;
  className?: string;
}

export function PhoneInput({
  value,
  onChange,
  error,
  defaultCountry = "in",
  className,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { inputValue, country, setCountry, handlePhoneValueChange, inputRef } =
    usePhoneInput({
      defaultCountry,
      value,
      forceDialCode: true,
      onChange: ({ phone }) => onChange(phone),
    });

  // Close on outside click
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

  // Close on Escape
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

  // Auto-focus search when dropdown opens
  useEffect(() => {
    if (open) {
      // Timeout lets the dropdown render before focusing
      const id = setTimeout(() => searchRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return PARSED_COUNTRIES;
    return PARSED_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso2.toLowerCase().startsWith(q),
    );
  }, [search]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "flex h-10 w-full rounded-xl border border-input bg-background text-sm ring-offset-background",
        "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        "transition-colors",
        error && "border-destructive focus-within:ring-destructive",
        className,
      )}
    >
      {/* ── Country selector ───────────────────────────────── */}
      <div className="relative flex-none">
        <button
          type="button"
          aria-label="Select country"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex h-full items-center gap-1 pl-3 pr-2 rounded-l-xl",
            "hover:bg-muted/60 transition-colors focus:outline-none",
          )}
        >
          <span className="text-base leading-none">{isoToFlag(country.iso2)}</span>
          <span className="text-xs text-muted-foreground">+{country.dialCode}</span>
          <ChevronDown
            className={cn(
              "size-3 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-xl border border-border bg-background shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-2.5 py-1.5">
                <Search className="size-3.5 text-muted-foreground flex-none" />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or dial code…"
                  className="flex-1 min-w-0 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>

            {/* Country list */}
            <div className="max-h-52 overflow-y-auto p-1">
              {filteredCountries.length === 0 ? (
                <p className="px-3 py-4 text-xs text-center text-muted-foreground">
                  No countries found
                </p>
              ) : (
                filteredCountries.map((c) => (
                  <button
                    key={c.iso2}
                    type="button"
                    onClick={() => {
                      setCountry(c.iso2 as CountryIso2, { focusOnInput: true });
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 transition-colors text-left",
                      "hover:bg-muted/50",
                      country.iso2 === c.iso2 && "bg-primary/10 text-primary",
                    )}
                  >
                    <span className="text-base leading-none">{isoToFlag(c.iso2)}</span>
                    <span className="flex-1 truncate text-xs">{c.name}</span>
                    <span className="text-xs text-muted-foreground">+{c.dialCode}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="w-px bg-border my-2 flex-none" />

      {/* ── Phone number input ─────────────────────────────── */}
      <input
        ref={inputRef}
        value={inputValue}
        onChange={handlePhoneValueChange}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="Phone number"
        className="flex-1 min-w-0 px-3 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

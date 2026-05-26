"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { MainNoteCategory, Gender } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { cn, formatPKR } from "@/lib/utils";

const PRICE_SLIDER_MAX = 100_000;

const NOTE_OPTIONS: MainNoteCategory[] = [
  "Woody",
  "Citrus",
  "Floral",
  "Oriental",
  "Fresh",
  "Spicy",
  "Gourmand",
  "Amber",
];

export type ShopFiltersState = {
  priceRange: [number, number];
  gender: Gender | "all";
  notes: MainNoteCategory[];
  longevityMin: number;
  sillageMin: number;
  sizeMlRange: [number, number];
};

export function FilterSidebar({
  value,
  onChange,
  className,
}: {
  value: ShopFiltersState;
  onChange: (next: ShopFiltersState) => void;
  className?: string;
}) {
  function toggleNote(n: MainNoteCategory) {
    const has = value.notes.includes(n);
    onChange({
      ...value,
      notes: has ? value.notes.filter((x) => x !== n) : [...value.notes, n],
    });
  }

  return (
    <aside className={cn("space-y-8", className)}>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Price
        </h3>
        <div className="mt-4 space-y-4">
          <Slider
            min={0}
            max={PRICE_SLIDER_MAX}
            step={500}
            value={value.priceRange}
            onValueChange={(v) =>
              onChange({
                ...value,
                priceRange: [v[0], v[1]] as [number, number],
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            {formatPKR(value.priceRange[0])} — {formatPKR(value.priceRange[1])}
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Gender
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["all", "men", "women", "unisex"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ ...value, gender: g })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors",
                value.gender === g
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/15 text-muted-foreground hover:border-white/30",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Main notes
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {NOTE_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => toggleNote(n)}
              className={cn(
                "rounded-lg border px-2 py-2 text-left text-xs transition-colors",
                value.notes.includes(n)
                  ? "border-gold/50 bg-gold/10 text-foreground"
                  : "border-border/50 text-muted-foreground hover:border-white/25",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <AdvancedFilters>
        <div>
          <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Longevity (min)
          </Label>
          <Slider
            className="mt-4"
            min={1}
            max={5}
            step={1}
            value={[value.longevityMin]}
            onValueChange={(v) =>
              onChange({ ...value, longevityMin: v[0] })
            }
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {value.longevityMin}+ / 5
          </p>
        </div>

        <div className="mt-8">
          <Label className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Sillage (min)
          </Label>
          <Slider
            className="mt-4"
            min={1}
            max={5}
            step={1}
            value={[value.sillageMin]}
            onValueChange={(v) =>
              onChange({ ...value, sillageMin: v[0] })
            }
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {value.sillageMin}+ / 5
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Bottle size (ml)
          </h3>
          <Slider
            className="mt-4"
            min={30}
            max={100}
            step={10}
            value={value.sizeMlRange}
            onValueChange={(v) =>
              onChange({
                ...value,
                sizeMlRange: [v[0], v[1]] as [number, number],
              })
            }
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {value.sizeMlRange[0]} ml — {value.sizeMlRange[1]} ml available
          </p>
        </div>
      </AdvancedFilters>
    </aside>
  );
}

function AdvancedFilters({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-2 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-smoke hover:text-ivory transition-colors">
          Advanced Filters
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="mt-6 animate-in fade-in slide-in-from-top-2">{children}</div>}
    </div>
  );
}

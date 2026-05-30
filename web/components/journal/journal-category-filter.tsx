"use client";

import { JOURNAL_CATEGORIES, type JournalCategory } from "@/lib/articles";

type JournalCategoryFilterProps = {
  active: JournalCategory;
  onChange: (category: JournalCategory) => void;
};

export function JournalCategoryFilter({
  active,
  onChange,
}: JournalCategoryFilterProps) {
  return (
    <div className="mt-8 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin sm:flex-wrap sm:justify-center"
        role="tablist"
        aria-label="Filter by category"
      >
        {JOURNAL_CATEGORIES.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(cat)}
              className={`shrink-0 rounded-[2px] px-4 py-2 font-body font-semibold text-[11px] tracking-[0.2em] uppercase transition-all duration-300 ${
                isActive
                  ? "bg-gold text-noir shadow-sm"
                  : "border-2 border-gold/40 bg-transparent text-gold hover:bg-gold/10"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

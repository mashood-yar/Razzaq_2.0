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
              className={`shrink-0 rounded-full px-4 py-2 font-body text-[11px] font-medium uppercase tracking-[0.12em] transition-all duration-300 focus-ocean ${
                isActive
                  ? "border border-gold-warm bg-gold-subtle text-gold-bright"
                  : "border border-noir-muted bg-transparent text-text-secondary hover:border-gold-warm hover:bg-gold-subtle hover:text-gold-bright"
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

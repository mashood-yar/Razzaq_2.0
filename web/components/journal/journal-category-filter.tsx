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
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 focus-ocean ${
                isActive
                  ? "bg-[#0F4C75] text-white shadow-sm"
                  : "border-2 border-[#3282B8] bg-transparent text-[#3282B8] hover:bg-[#3282B8]/10"
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

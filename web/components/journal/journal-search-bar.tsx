"use client";

import { Search } from "lucide-react";

type JournalSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function JournalSearchBar({ value, onChange }: JournalSearchBarProps) {
  return (
    <div className="relative mx-auto mt-8 max-w-md">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gold-warm)]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search stories..."
        className="h-[52px] w-full rounded-[2px] border border-[var(--border-mid)] bg-[var(--bg-dusk)] pl-11 pr-5 font-body font-light text-[14px] text-[var(--cream-bone)] placeholder-[var(--cream-muted)] shadow-sm focus:border-[var(--gold-warm)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--gold-warm)]/60 transition-colors"
        aria-label="Search journal stories"
      />
    </div>
  );
}

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
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search stories..."
        className="focus-ocean h-12 w-full rounded-none border border-border bg-noir-surface/80 pl-11 pr-5 text-sm text-foreground placeholder:text-muted-foreground shadow-sm backdrop-blur-sm"
        aria-label="Search journal stories"
      />
    </div>
  );
}

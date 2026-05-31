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
        className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gold-warm"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search stories..."
        className="input-luxe pl-7"
        aria-label="Search journal stories"
      />
    </div>
  );
}

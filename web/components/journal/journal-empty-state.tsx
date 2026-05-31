export function JournalEmptyState() {
  return (
    <div className="mx-auto mt-16 flex max-w-md flex-col items-center border border-border bg-noir-surface px-8 py-16 text-center">
      <span className="eyebrow">No Results</span>
      <h2 className="mt-4 font-display text-2xl font-light text-foreground sm:text-3xl">
        No stories found
      </h2>
      <div className="mx-auto mt-4 h-px w-12 bg-gold-warm/50" aria-hidden="true" />
      <p className="mt-4 text-sm font-light text-muted-foreground">
        Try a different search or category filter.
      </p>
    </div>
  );
}

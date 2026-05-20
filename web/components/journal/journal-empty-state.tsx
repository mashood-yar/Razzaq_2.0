export function JournalEmptyState() {
  return (
    <div className="relative mx-auto mt-16 flex max-w-md flex-col items-center py-16 text-center">
      <div
        className="absolute inset-0 -z-10 opacity-50"
        aria-hidden="true"
      >
        <div
          className="mx-auto h-48 w-48 rounded-[40%_60%_55%_45%/50%_40%_60%_50%] bg-[#1B3A4B]"
          style={{ animation: "organic-float 10s ease-in-out infinite" }}
        />
      </div>
      <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        No stories yet — check back soon
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        Try a different search or category filter.
      </p>
    </div>
  );
}

export function JournalHeader() {
  return (
    <header className="mx-auto max-w-3xl text-center">
      <h1 className="font-display text-4xl font-semibold text-foreground sm:text-5xl lg:text-6xl">
        The RazzaqLuxe Journal
      </h1>
      <div className="mx-auto mt-4 flex justify-center" aria-hidden="true">
        <svg
          width="280"
          height="12"
          viewBox="0 0 280 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-48 sm:w-64 lg:w-72"
        >
          <path
            d="M4 8C40 2 80 10 120 6C160 2 200 9 240 5C260 3 272 7 276 6"
            stroke="#D4A832"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M8 10C50 6 95 11 140 8C185 5 230 10 272 7"
            stroke="#C49A1E"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>
      <p className="mt-5 font-body text-base text-muted-foreground sm:text-lg">
        Stories of craft, culture, and the art of living well
      </p>
    </header>
  );
}

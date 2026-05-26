export function JournalHeader() {
  return (
    <header className="mx-auto max-w-3xl text-center pb-12 pt-8">
      <p className="font-body font-semibold text-[10px] tracking-[0.4em] text-[var(--gold-warm)] mb-4 uppercase">
        Razzaq Luxe
      </p>
      <h1 className="font-display italic font-light text-[3rem] lg:text-[4rem] text-[var(--cream-bone)] leading-tight">
        The Journal
      </h1>
      <div className="w-[40px] h-[1px] bg-[var(--gold-warm)] mx-auto mt-6 mb-8" />
      <p className="mt-5 font-body text-[15px] font-light text-[var(--cream-muted)] max-w-lg mx-auto">
        Stories of craft, culture, and the art of living well.
      </p>
    </header>
  );
}

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-[var(--bg-obsidian)] px-4 py-16">
      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="rounded-[4px] border border-[var(--border-mid)] bg-[var(--bg-dusk)] p-8 shadow-2xl sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

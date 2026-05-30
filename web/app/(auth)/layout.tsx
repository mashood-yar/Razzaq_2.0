import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-noir px-4 py-16">
      <div className="organic-blob -left-24 top-12 h-64 w-64 opacity-25" aria-hidden />
      <div
        className="pointer-events-none absolute -right-16 bottom-24 h-72 w-72 rounded-full blur-3xl opacity-20"
        style={{
          background: "radial-gradient(circle, rgb(196 154 30 / 0.15) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center">
        <div className="rounded-sm border border-border bg-noir-surface/95 p-8 shadow-nocturne backdrop-blur-sm sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      toastOptions={{
        className:
          "!bg-[var(--bg-dusk)] !text-[var(--cream-bone)] !border !border-[var(--border-fine)] !shadow-2xl !font-body !font-light !text-[13px] !rounded-[4px]",
        duration: 4500,
        style: {
          padding: '12px 16px',
        }
      }}
    />
  );
}

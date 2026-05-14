"use client";

import { Toaster } from "react-hot-toast";

export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      toastOptions={{
        className:
          "!bg-card !text-foreground !border !border-border !shadow-lg",
        duration: 4500,
      }}
    />
  );
}

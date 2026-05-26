import type { ReactNode } from "react";
import { SidebarNav } from "@/components/account/sidebar-nav";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--bg-obsidian)] text-[var(--cream-bone)] pb-32">
      {/* Cinematic Banner Space */}
      <div className="w-full h-[80px] lg:h-[120px] bg-[var(--bg-void)] border-b border-[var(--border-fine)]" />
      
      <div className="max-w-[1440px] mx-auto pt-4 lg:pt-16 flex flex-col lg:flex-row gap-0 lg:gap-12 lg:px-12">
        <SidebarNav />
        <div className="flex-1 px-5 lg:px-0 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

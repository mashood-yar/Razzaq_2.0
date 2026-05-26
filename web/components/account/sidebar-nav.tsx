"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/auth/sign-out-form";

export function SidebarNav() {
  const pathname = usePathname();
  const tabs = [
    { name: "Profile", href: "/account/profile" },
    { name: "Orders", href: "/account/orders" },
    { name: "Addresses", href: "/account/address" },
  ];

  return (
    <>
      {/* Mobile Tab Bar */}
      <div className="lg:hidden w-full overflow-x-auto hide-scrollbar border-b border-[var(--border-fine)] mb-8 sticky top-[56px] bg-[var(--bg-obsidian)] z-20">
        <div className="flex w-max px-4">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link 
                key={tab.name} 
                href={tab.href}
                className={`px-5 py-4 font-body font-semibold text-[11px] tracking-[0.2em] uppercase whitespace-nowrap border-b-[2px] transition-colors ${
                  active ? "text-[var(--gold-warm)] border-[var(--gold-warm)]" : "text-[var(--cream-ghost)] border-transparent hover:text-[var(--cream-bone)]"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-[200px] shrink-0 border-r border-[var(--border-fine)] pr-8 min-h-[calc(100vh-200px)] sticky top-[120px] h-fit">
        <h2 className="font-display italic text-[2rem] text-[var(--cream-bone)] mb-8">My Account</h2>
        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link 
                key={tab.name} 
                href={tab.href}
                className={`px-4 py-3 font-body font-semibold text-[11px] tracking-[0.2em] uppercase border-l-[2px] transition-colors ${
                  active ? "text-[var(--gold-warm)] border-[var(--gold-warm)] bg-[rgba(201,160,80,0.06)]" : "text-[var(--cream-ghost)] border-transparent hover:text-[var(--cream-bone)] hover:bg-[var(--bg-dusk)]"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-12 pt-8 border-t border-[var(--border-fine)]">
          <SignOutButton />
        </div>
      </div>
    </>
  );
}

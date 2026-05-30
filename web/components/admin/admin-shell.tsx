"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Mail,
  LogOut,
  Menu,
  Sparkles,
  Tag,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  isAdminNavActive,
} from "@/lib/admin/paths";
import { cn } from "@/lib/utils";

const navItems = [
  { href: ADMIN_HOME_PATH, label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/highlights", label: "Highlights", icon: Tag },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isAdminNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "admin-nav-link",
              isActive ? "admin-nav-link-active" : "admin-nav-link-inactive",
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginRoute =
    pathname === ADMIN_LOGIN_PATH ||
    pathname.startsWith(`${ADMIN_LOGIN_PATH}/`);
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || cancelled) return;
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (!cancelled) {
            setUserName(data?.full_name || user.email || "Admin");
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const handleLogout = async () => {
    if (!supabase) {
      window.location.href = ADMIN_LOGIN_PATH;
      return;
    }
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    window.location.href = ADMIN_LOGIN_PATH;
  };

  const currentPage =
    navItems.find((item) => isAdminNavActive(pathname, item.href))?.label ??
    "Admin";

  if (isLoginRoute) {
    return <div className="admin-shell">{children}</div>;
  }

  return (
    <div className="admin-shell flex min-h-screen bg-ocean-deep">
      <aside className="admin-sidebar hidden md:flex">
        <div className="border-b border-border-subtle px-6 py-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-primary/30 text-gold-light">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-lg font-bold leading-tight text-foreground">
                RazzaqLuxe
              </p>
              <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Admin
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 py-4">
          <SidebarNav pathname={pathname} />
        </div>
        <div className="border-t border-border-subtle p-4">
          <div className="mb-3 rounded-xl bg-ocean-deep/40 px-4 py-3">
            <p className="font-body text-xs text-muted-foreground">Signed in as</p>
            <p className="truncate font-body text-sm font-semibold text-foreground">
              {userName}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 rounded-xl font-body text-muted-foreground hover:bg-ocean-primary/15 hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 border-border-subtle bg-ocean-surface p-0"
              >
                <div className="border-b border-border-subtle px-6 py-5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-primary/30 text-gold-light">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold text-foreground">
                        RazzaqLuxe
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Admin
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-4">
                  <SidebarNav
                    pathname={pathname}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 border-t border-border-subtle bg-ocean-surface p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-xl"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-wider text-ocean-light/60">
                {currentPage}
              </p>
              <h2 className="font-display text-lg font-semibold text-foreground md:hidden">
                RazzaqLuxe Admin
              </h2>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex md:pr-1">
            <span className="max-w-[160px] truncate font-body text-sm text-muted-foreground lg:max-w-[220px]">
              {userName}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full hover:bg-ocean-primary/15"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-auto px-5 py-6 md:px-8 md:py-8 lg:px-10">
          {!supabase ? (
            <div className="mb-6 rounded-2xl border border-gold-light/30 bg-gold-light/5 px-4 py-3 font-body text-sm text-foreground">
              Supabase browser keys are not set. Add NEXT_PUBLIC_SUPABASE_URL and
              NEXT_PUBLIC_SUPABASE_ANON_KEY to{" "}
              <code className="font-mono text-xs text-ocean-light">
                web/.env.local
              </code>
              , then restart the dev server.
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

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
} from "lucide-react";
import toast from "react-hot-toast";
import { ADMIN_HOME_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin/paths";

const navItems = [
  { href: ADMIN_HOME_PATH, label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  const SidebarContent = () => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-gold text-obsidian font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-display font-bold text-foreground">
            Admin Panel
          </h1>
        </div>
        <div className="flex-1 p-4">
          <SidebarContent />
        </div>
        <div className="p-4 border-t border-border">
          <div className="mb-4 px-4">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="text-sm font-medium text-foreground truncate">
              {userName}
            </p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-display font-bold text-foreground">
              Admin Panel
            </h1>
          </div>
          <div className="p-4">
            <SidebarContent />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h1 className="text-lg font-display font-bold">Admin Panel</h1>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <h2 className="text-lg font-medium text-muted-foreground">
            {navItems.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"))?.label || "Admin"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {userName}
            </span>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {!supabase ? (
            <div className="mb-6 rounded-xl border border-amber-800/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
              Supabase browser keys are not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to{' '}
              <code className="font-mono text-xs">web/.env.local</code>, then restart the dev server so admin tools can load signed-in profiles.
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

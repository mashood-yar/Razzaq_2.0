"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { ADMIN_HOME_PATH } from "@/lib/admin/paths";
import { Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!supabase) {
      toast.error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }

      toast.success("Logged in successfully");
      router.push(ADMIN_HOME_PATH);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ocean-deep px-4">
      <div
        className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-ocean-primary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-16 h-64 w-64 rounded-full bg-gold-light/10 blur-3xl"
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ocean-primary/30 text-gold-light">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            RazzaqLuxe Admin
          </h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">
            Sign in to manage your luxury storefront
          </p>
        </div>

        <div className="rounded-2xl border border-border-subtle/80 bg-ocean-surface/95 p-8 shadow-ocean backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="admin-input h-11 rounded-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-body text-sm">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="admin-input h-11 rounded-full"
              />
            </div>

            <Button
              type="submit"
              className="admin-btn-primary h-11 w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/shop"
            className="font-body text-sm text-muted-foreground transition-colors hover:text-ocean-light"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

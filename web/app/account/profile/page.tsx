"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/types";
import { ScentProfileResults } from "@/components/account/scent-profile-results";
import { parseScentProfile } from "@/lib/quiz/scent-profile";

export default function AccountProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [scentProfile, setScentProfile] = useState<ReturnType<typeof parseScentProfile>>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/account/profile", { credentials: "include" });
        const data = (await res.json()) as {
          profile?: Profile;
          email?: string | null;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        if (data.profile) {
          setFullName(data.profile.full_name ?? "");
          setPhone(data.profile.phone ?? "");
          setScentProfile(
            data.profile.scent_profile ??
              parseScentProfile(
                (data.profile as { scent_profile?: unknown }).scent_profile,
              ),
          );
        }
        if (data.email) setEmail(data.email);
      } catch {
        setMsg("Could not load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email: email.trim(),
          newPassword: password.length >= 8 ? password : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMsg("Saved. If you changed email or password, check your inbox.");
      setPassword("");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="mx-auto max-w-lg px-4 py-20">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-4xl">Profile</h1>
      <div className="mt-8">
        <ScentProfileResults initialProfile={scentProfile} />
      </div>
      <div className="mt-10 space-y-4">
        <div>
          <Label htmlFor="nm">Full name</Label>
          <Input
            id="nm"
            className="mt-1.5"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="ph">Phone</Label>
          <Input
            id="ph"
            className="mt-1.5"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="em">Email</Label>
          <Input
            id="em"
            type="email"
            className="mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pw">New password (optional, min 8 chars)</Label>
          <Input
            id="pw"
            type="password"
            className="mt-1.5"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {msg && <p className="mt-4 text-sm text-muted-foreground">{msg}</p>}
      <Button className="mt-8" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </Button>
      <p className="mt-10 text-sm">
        <Link href="/account" className="text-muted-foreground hover:text-foreground">
          ← Account
        </Link>
      </p>
    </div>
  );
}

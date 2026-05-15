"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PK_PROVINCES } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function AccountAddressPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/account/profile", { credentials: "include" });
        const data = (await res.json()) as {
          profile?: Profile;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        const p = data.profile;
        if (p) {
          setForm({
            fullName: p.full_name ?? "",
            phone: p.phone ?? "",
            address: p.address_line ?? "",
            city: p.city ?? "",
            province: p.province ?? "",
          });
        }
      } catch {
        setMsg("Could not load your saved address.");
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
          full_name: form.fullName,
          phone: form.phone,
          address_line: form.address,
          city: form.city,
          province: form.province,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMsg("Saved.");
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
      <h1 className="font-serif text-4xl">Saved address</h1>
      <p className="mt-2 text-muted-foreground">
        One shipping address — used to pre-fill checkout.
      </p>
      <div className="mt-10 space-y-4">
        <div>
          <Label htmlFor="fn">Full name</Label>
          <Input
            id="fn"
            className="mt-1.5"
            value={form.fullName}
            onChange={(e) =>
              setForm((s) => ({ ...s, fullName: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="ph">Phone</Label>
          <Input
            id="ph"
            className="mt-1.5"
            value={form.phone}
            onChange={(e) =>
              setForm((s) => ({ ...s, phone: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="ad">Address</Label>
          <Input
            id="ad"
            className="mt-1.5"
            value={form.address}
            onChange={(e) =>
              setForm((s) => ({ ...s, address: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="ci">City</Label>
          <Input
            id="ci"
            className="mt-1.5"
            value={form.city}
            onChange={(e) =>
              setForm((s) => ({ ...s, city: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Province</Label>
          <select
            className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={form.province}
            onChange={(e) =>
              setForm((s) => ({ ...s, province: e.target.value }))
            }
          >
            <option value="">Select province</option>
            {PK_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      {msg && <p className="mt-4 text-sm text-muted-foreground">{msg}</p>}
      <Button className="mt-8" onClick={() => void save()} disabled={saving}>
        {saving ? "Saving…" : "Save address"}
      </Button>
      <p className="mt-10 text-sm">
        <Link href="/account" className="text-muted-foreground hover:text-foreground">
          ← Account
        </Link>
      </p>
    </div>
  );
}

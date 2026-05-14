import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const status =
      typeof body.status === "string" ? body.status : undefined;
    const paymentStatusRaw =
      typeof body.payment_status === "string"
        ? body.payment_status.trim()
        : undefined;

    const allowedPaymentStatuses = [
      "pending",
      "verified",
      "failed",
      "paid",
      "refunded",
    ] as const;

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (paymentStatusRaw !== undefined) {
      if (
        !allowedPaymentStatuses.includes(
          paymentStatusRaw as (typeof allowedPaymentStatuses)[number],
        )
      ) {
        return NextResponse.json(
          { error: "Invalid payment_status value" },
          { status: 400 },
        );
      }
      updates.payment_status = paymentStatusRaw;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Provide status and/or payment_status" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (status !== undefined) {
      await supabase.from("order_status_history").insert({
        order_id: id,
        status,
        changed_by: user.id,
      });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 });
  }
}

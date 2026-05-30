import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type BulkAction =
  | "mark_on_sale"
  | "mark_trending"
  | "mark_premium"
  | "clear_sale"
  | "clear_trending"
  | "clear_premium"
  | "clear_highlights";

type BulkBody = {
  action: BulkAction;
  productIds?: string[];
  categoryId?: string;
  tag?: string;
  discountPercent?: number | null;
  salePrice?: number | null;
  saleStartAt?: string | null;
  saleEndAt?: string | null;
};

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user };
}

async function resolveProductIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  body: BulkBody,
): Promise<string[]> {
  if (body.productIds?.length) return body.productIds;

  let query = supabase.from("products").select("id");

  if (body.categoryId) {
    query = query.eq("category_id", body.categoryId);
  }

  if (body.tag?.trim()) {
    query = query.contains("tags", [body.tag.trim()]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => row.id as string);
}

function buildUpdatePayload(action: BulkAction, body: BulkBody): Record<string, unknown> {
  switch (action) {
    case "mark_on_sale":
      return {
        on_sale: true,
        ...(body.salePrice != null ? { sale_price: body.salePrice, discount_percent: null } : {}),
        ...(body.discountPercent != null
          ? { discount_percent: body.discountPercent, sale_price: null }
          : {}),
        ...(body.saleStartAt !== undefined ? { sale_start_at: body.saleStartAt } : {}),
        ...(body.saleEndAt !== undefined ? { sale_end_at: body.saleEndAt } : {}),
      };
    case "mark_trending":
      return { is_trending: true };
    case "mark_premium":
      return { is_premium: true };
    case "clear_sale":
      return {
        on_sale: false,
        sale_price: null,
        discount_percent: null,
        sale_start_at: null,
        sale_end_at: null,
      };
    case "clear_trending":
      return { is_trending: false };
    case "clear_premium":
      return { is_premium: false };
    case "clear_highlights":
      return {
        is_trending: false,
        is_premium: false,
        on_sale: false,
        sale_price: null,
        discount_percent: null,
        sale_start_at: null,
        sale_end_at: null,
      };
    default:
      throw new Error("Invalid action");
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const auth = await requireAdmin(supabase);
  if ("error" in auth && auth.error) return auth.error;

  try {
    const body = (await request.json()) as BulkBody;
    const { action } = body;

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    const productIds = await resolveProductIds(supabase, body);
    if (productIds.length === 0) {
      return NextResponse.json({ error: "No products matched the selection" }, { status: 400 });
    }

    const updatePayload = buildUpdatePayload(action, body);

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .in("id", productIds)
      .select("id");

    if (error) throw error;

    return NextResponse.json({
      updated: data?.length ?? 0,
      productIds: data?.map((row) => row.id) ?? [],
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Bulk update failed" },
      { status: 500 },
    );
  }
}

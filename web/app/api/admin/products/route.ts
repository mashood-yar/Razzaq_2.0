import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { withTimeout } from "@/lib/async/with-timeout";

/** Next limits server lifetime; modestly above hard POST envelope */
export const maxDuration = 15;

export async function GET(request: NextRequest) {
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

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "name";

    let query = supabase
      .from("products")
      .select(`
        *,
        categories(name),
        product_images(url, is_primary)
      `);

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const sortColumn = sortBy === "price" ? "price_pkr" : sortBy === "stock" ? "stock_quantity" : "name";
    query = query.order(sortColumn, { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch products" }, { status: 500 });
  }
}

function logAdminSupabase(scope: string, err: unknown) {
  const o =
    err && typeof err === "object"
      ? (err as Record<string, unknown>)
      : {};
  const safe = {
    message: typeof o.message === "string" ? o.message : String(err),
    code: typeof o.code === "string" ? o.code : undefined,
    details: typeof o.details === "string" ? o.details : undefined,
    hint: typeof o.hint === "string" ? o.hint : undefined,
  };
  console.error(scope, safe);
  try {
    console.error(`${scope} JSON`, JSON.stringify(o, null, 2));
  } catch {
    /* ignore */
  }
}

function clientFacingFromSupabase(err: unknown): string {
  if (!err || typeof err !== "object") {
    return err instanceof Error ? err.message : "Failed to create product";
  }
  const o = err as Record<string, unknown>;
  const m = typeof o.message === "string" ? o.message : "Failed to create product";
  const details = typeof o.details === "string" ? o.details : "";
  const hint = typeof o.hint === "string" ? o.hint : "";
  return [m, details, hint].filter(Boolean).join(" — ");
}

function asFiniteNumber(v: unknown, label: string): number {
  const n = typeof v === "number" ? v : Number.parseFloat(String(v));
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid ${label}`);
  }
  return n;
}

function asInt(v: unknown, label: string): number {
  const n = typeof v === "number" ? v : Number.parseInt(String(v), 10);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid ${label}`);
  }
  return n;
}

const POST_HARD_LIMIT_MS = 10_000;
const WAIT_CREATE_CLIENT_MS = 8_000;
const WAIT_AUTH_MS = 8_000;
const WAIT_PROFILE_MS = 8_000;
const WAIT_JSON_MS = 8_000;
const WAIT_INSERT_MS = 8_000;

async function executeAdminProductCreate(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await withTimeout(createClient(), WAIT_CREATE_CLIENT_MS, "createServerClient");

    const {
      data: { user },
      error: getUserErr,
    } = await withTimeout(supabase.auth.getUser(), WAIT_AUTH_MS, "supabase.auth.getUser");
    if (getUserErr) console.error("[api/admin/products POST] getUser:", getUserErr.message);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profileRes = await withTimeout(
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      WAIT_PROFILE_MS,
      "profiles.select(role)",
    );
    const { data: profile, error: profileErr } = profileRes as {
      data: { role: string } | null;
      error: { message: string } | null;
    };
    if (profileErr) {
      console.error("[api/admin/products POST] profiles:", profileErr.message);
      return NextResponse.json({ error: clientFacingFromSupabase(profileErr) }, { status: 403 });
    }
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bodyRaw = await withTimeout(request.json(), WAIT_JSON_MS, "request.json");
    const { name: rawName, description, sku: rawSku, price_pkr, stock_quantity, category_id, status, images, slug: bodySlug } =
      bodyRaw as {
        name: string;
        description?: string | null;
        sku?: string | null;
        price_pkr: number | string;
        stock_quantity: number | string;
        category_id: string;
        status?: string | null;
        images?: Array<{ url: string }>;
        slug?: string | null;
      };

    const name = typeof rawName === "string" ? rawName.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const UUID_RE =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const cat = typeof category_id === "string" ? category_id.trim() : "";
    if (!UUID_RE.test(cat)) {
      return NextResponse.json({ error: "Invalid category_id — must be a valid category UUID" }, { status: 400 });
    }

    const trimmedSku = typeof rawSku === "string" ? rawSku.trim() : "";
    const generatedSku = `SKU-${randomUUID().replace(/-/g, "").slice(0, 14)}`;
    const skuFinal = trimmedSku.length > 0 ? trimmedSku : generatedSku;

    const baseSlug =
      slugify(name).length > 0 ? slugify(name) : "product";

    const slug =
      typeof bodySlug === "string" && bodySlug.trim().length > 0
        ? bodySlug.trim().toLowerCase()
        : `${baseSlug}-${randomUUID().slice(0, 10)}`;

    const priceNum = asFiniteNumber(price_pkr, "price_pkr");
    const stockNum = asInt(stock_quantity, "stock_quantity");

    let normalizedStatus =
      typeof status === "string" && status.trim().length > 0 ? status.trim() : "draft";
    if (
      normalizedStatus !== "draft" &&
      normalizedStatus !== "active" &&
      normalizedStatus !== "archived"
    ) {
      console.warn("[api/admin/products POST] invalid status, defaulting to draft:", normalizedStatus);
      normalizedStatus = "draft";
    }

    const insertRow = {
      name,
      slug,
      description:
        typeof description === "string" ? description.trim() || null : description ?? null,
      sku: skuFinal,
      price_pkr: priceNum,
      stock_quantity: stockNum,
      category_id: cat,
      status: normalizedStatus,
    };

    console.info("[api/admin/products POST] insertRow", JSON.stringify(insertRow));

    const { data: product, error: productError } = await withTimeout(
      supabase.from("products").insert(insertRow).select().single(),
      WAIT_INSERT_MS,
      "products.insert",
    );

    if (productError) {
      logAdminSupabase("[api/admin/products POST] products.insert failed", productError);
      return NextResponse.json({ error: clientFacingFromSupabase(productError) }, { status: 500 });
    }

    /** Body `images` is only HTTPS URL strings from prior Cloudinary upload — never re-uploads blobs here */
    if (images && images.length > 0 && product) {
      const imageRows = images
        .filter((img) => typeof img?.url === "string" && img.url.trim().length > 0)
        .map((img, idx: number) => ({
          product_id: product.id,
          url: img.url.trim(),
          is_primary: idx === 0,
          sort_order: idx,
        }));
      if (imageRows.length === 0) {
        console.warn("[api/admin/products POST] skipping product_images insert — no urls");
      } else {
        const { error: imgErr } = await withTimeout(
          supabase.from("product_images").insert(imageRows),
          WAIT_INSERT_MS,
          "product_images.insert",
        );
        if (imgErr) {
          logAdminSupabase("[api/admin/products POST] product_images.insert failed", imgErr);
          return NextResponse.json(
            {
              error: `Product saved but images failed to save — ${clientFacingFromSupabase(imgErr)}`,
            },
            { status: 500 },
          );
        }
      }
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    logAdminSupabase("[api/admin/products POST] exception", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    return await Promise.race([
      executeAdminProductCreate(request),
      new Promise<NextResponse>((_, reject) =>
        setTimeout(() => {
          console.error("[api/admin/products POST] exceeded hard limit ms=", POST_HARD_LIMIT_MS);
          reject(new Error(`Product creation timed out after ${POST_HARD_LIMIT_MS / 1000}s`));
        }, POST_HARD_LIMIT_MS),
      ),
    ]);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = /timed out/i.test(msg) ? 504 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

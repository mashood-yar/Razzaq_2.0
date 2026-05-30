"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ExternalLink,
  Flame,
  Crown,
  Tag,
  Search,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatPKR } from "@/lib/utils";
import type { Product, ProductImage } from "@/lib/types";
import {
  computeSalePricePkr,
  isSaleWindowActive,
} from "@/lib/product-highlights";
import {
  buildCtaPreviews,
  getHighlightCounts,
  productMatchesTab,
  tabFlagField,
  type HighlightTab,
} from "@/lib/admin/highlights-cta";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminBulkBar,
  AdminFilterRow,
  AdminSearchField,
  AdminStatCard,
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTh,
  AdminTr,
  AdminTd,
  AdminStatusBadge,
  AdminEmptyState,
  AdminLoading,
} from "@/components/admin/admin-ui";

type HighlightProduct = Product & {
  product_images?: ProductImage[];
  categories?: { name: string } | null;
};

type SaleDraft = {
  discount_percent: string;
  sale_price: string;
  sale_start_at: string;
  sale_end_at: string;
};

function saleDraftFromProduct(product: HighlightProduct): SaleDraft {
  return {
    discount_percent:
      product.discount_percent != null ? String(product.discount_percent) : "",
    sale_price: product.sale_price != null ? String(product.sale_price) : "",
    sale_start_at: product.sale_start_at
      ? product.sale_start_at.slice(0, 16)
      : "",
    sale_end_at: product.sale_end_at ? product.sale_end_at.slice(0, 16) : "",
  };
}

function ToggleSwitch({
  id,
  checked,
  onChange,
  disabled,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        aria-label={label}
        className="h-5 w-5 accent-gold-light"
      />
    </label>
  );
}

function CtaPreviewCard({
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
  variant,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  variant: "ocean" | "gold";
}) {
  const bg =
    variant === "ocean"
      ? "border-ocean-mid/40 bg-ocean-primary/15"
      : "border-gold/30 bg-gold/10";

  return (
    <div className={`rounded-2xl border p-4 ${bg}`}>
      <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Storefront CTA preview
      </p>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-light">
        {eyebrow}
      </p>
      <p className="mt-1 font-display text-lg font-semibold text-foreground">{title}</p>
      <p className="mt-1 font-body text-sm text-muted-foreground">{description}</p>
      <p className="mt-3 font-body text-xs text-muted-foreground">
        Links to{" "}
        <code className="rounded bg-ocean-deep/50 px-1.5 py-0.5 font-mono text-ocean-light">
          {href}
        </code>{" "}
        · button: &quot;{ctaLabel}&quot;
      </p>
    </div>
  );
}

export function HighlightsDashboard() {
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [products, setProducts] = useState<HighlightProduct[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<HighlightTab>("sale");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saleDrafts, setSaleDrafts] = useState<Record<string, SaleDraft>>({});
  const [categorySaleOpen, setCategorySaleOpen] = useState(false);
  const [bulkDiscount, setBulkDiscount] = useState("20");
  const [bulkCategoryId, setBulkCategoryId] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories:category_id(name),
          product_images(url, is_primary)
        `,
        )
        .neq("status", "archived")
        .order("name", { ascending: true });

      if (error) throw error;
      const rows = (data ?? []) as HighlightProduct[];
      setProducts(rows);
      const drafts: Record<string, SaleDraft> = {};
      for (const row of rows) {
        drafts[row.id] = saleDraftFromProduct(row);
      }
      setSaleDrafts(drafts);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("categories")
      .select("id, name")
      .order("sort_order")
      .then(({ data }) => setCategories(data ?? []));
  }, [supabase]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [tab, search, categoryFilter, showFlaggedOnly]);

  const counts = useMemo(() => getHighlightCounts(products), [products]);
  const ctaPreviews = useMemo(() => buildCtaPreviews(products), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (categoryFilter !== "all" && product.category_id !== categoryFilter) {
        return false;
      }
      if (search && !product.name.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (showFlaggedOnly && !productMatchesTab(product, tab)) {
        return false;
      }
      return true;
    });
  }, [products, categoryFilter, search, showFlaggedOnly, tab]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const ids = filteredProducts.map((p) => p.id);
    const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const patchHighlight = async (
    productId: string,
    payload: Record<string, unknown>,
  ) => {
    setSavingId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Update failed");
      await fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const handleTabToggle = async (product: HighlightProduct, enabled: boolean) => {
    const field = tabFlagField(tab);
    if (tab === "sale" && enabled) {
      const draft = saleDrafts[product.id] ?? saleDraftFromProduct(product);
      const discount = draft.discount_percent.trim();
      await patchHighlight(product.id, {
        on_sale: true,
        ...(discount ? { discount_percent: parseInt(discount, 10), sale_price: null } : {}),
      });
      return;
    }
    if (tab === "sale" && !enabled) {
      await patchHighlight(product.id, {
        on_sale: false,
        sale_price: null,
        discount_percent: null,
        sale_start_at: null,
        sale_end_at: null,
      });
      return;
    }
    await patchHighlight(product.id, { [field]: enabled });
  };

  const saveSaleDetails = async (product: HighlightProduct) => {
    const draft = saleDrafts[product.id] ?? saleDraftFromProduct(product);
    const salePrice = draft.sale_price.trim();
    const discount = draft.discount_percent.trim();

    await patchHighlight(product.id, {
      on_sale: true,
      sale_price: salePrice ? parseFloat(salePrice) : null,
      discount_percent: salePrice ? null : discount ? parseInt(discount, 10) : null,
      sale_start_at: draft.sale_start_at
        ? new Date(draft.sale_start_at).toISOString()
        : null,
      sale_end_at: draft.sale_end_at ? new Date(draft.sale_end_at).toISOString() : null,
    });
    toast.success(`Sale updated for ${product.name}`);
  };

  const runBulkAction = async (
    action:
      | "mark_on_sale"
      | "mark_trending"
      | "mark_premium"
      | "clear_sale"
      | "clear_trending"
      | "clear_premium"
      | "clear_highlights",
    extra?: { discountPercent?: number; categoryId?: string },
  ) => {
    setBulkLoading(true);
    try {
      const body: Record<string, unknown> = { action };

      if (extra?.categoryId) {
        body.categoryId = extra.categoryId;
      } else {
        if (selectedIds.size === 0) {
          toast.error("Select at least one product");
          return;
        }
        body.productIds = Array.from(selectedIds);
      }

      if (extra?.discountPercent != null) {
        body.discountPercent = extra.discountPercent;
      }

      const res = await fetch("/api/admin/products/bulk-highlights", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { error?: string; updated?: number };
      if (!res.ok) throw new Error(json.error || "Bulk update failed");

      toast.success(`Updated ${json.updated ?? 0} product(s)`);
      setSelectedIds(new Set());
      setCategorySaleOpen(false);
      await fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const tabBulkActions = (): {
    enable: () => void;
    disable: () => void;
    enableLabel: string;
    disableLabel: string;
  } => {
    switch (tab) {
      case "sale":
        return {
          enableLabel: "Mark on sale",
          disableLabel: "Clear sale",
          enable: () => void runBulkAction("mark_on_sale", { discountPercent: 20 }),
          disable: () => void runBulkAction("clear_sale"),
        };
      case "premium":
        return {
          enableLabel: "Mark premium",
          disableLabel: "Remove premium",
          enable: () => void runBulkAction("mark_premium"),
          disable: () => void runBulkAction("clear_premium"),
        };
      case "trending":
        return {
          enableLabel: "Mark trending",
          disableLabel: "Remove trending",
          enable: () => void runBulkAction("mark_trending"),
          disable: () => void runBulkAction("clear_trending"),
        };
    }
  };

  const bulk = tabBulkActions();
  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p.id));

  const tabMeta = {
    sale: {
      label: "On Sale",
      icon: Tag,
      count: counts.onSale,
      emptyTitle: "No products on sale",
      emptyDescription: "Toggle products on or use bulk actions to start a sale.",
      flagLabel: "On sale",
    },
    premium: {
      label: "Premium",
      icon: Crown,
      count: counts.premium,
      emptyTitle: "No premium products",
      emptyDescription: "Mark products as premium to feature them on /highlights.",
      flagLabel: "Premium",
    },
    trending: {
      label: "Trending",
      icon: Flame,
      count: counts.trending,
      emptyTitle: "No trending products",
      emptyDescription: "Mark bestsellers as trending for the Most Selling section.",
      flagLabel: "Trending",
    },
  } as const;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Highlights & Promotions"
        subtitle="Manage sale, premium, and trending products shown on the storefront"
        breadcrumb="Marketing"
        action={
          <Button asChild variant="outline" className="admin-btn-outline rounded-full">
            <Link href="/highlights" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview on site
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard title="On sale" value={counts.onSale} icon={Tag} accent="warning" />
        <AdminStatCard title="Premium" value={counts.premium} icon={Crown} accent="gold" />
        <AdminStatCard title="Trending" value={counts.trending} icon={Flame} accent="default" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CtaPreviewCard {...ctaPreviews.sale} variant="ocean" />
        <CtaPreviewCard {...ctaPreviews.premium} variant="gold" />
      </div>

      <AdminCard>
        <Tabs value={tab} onValueChange={(v) => setTab(v as HighlightTab)}>
          <AdminCardHeader
            title="Manage highlights"
            icon={Sparkles}
            action={
              <TabsList className="h-10 rounded-full border-border-subtle bg-ocean-deep/50">
                {(Object.keys(tabMeta) as HighlightTab[]).map((key) => {
                  const meta = tabMeta[key];
                  const Icon = meta.icon;
                  return (
                    <TabsTrigger
                      key={key}
                      value={key}
                      className="rounded-full data-[state=active]:bg-ocean-primary/30 data-[state=active]:text-foreground"
                    >
                      <Icon className="mr-1.5 h-4 w-4" />
                      {meta.label}
                      <span className="ml-1.5 rounded-full bg-ocean-deep/60 px-1.5 py-0.5 text-[10px] font-bold">
                        {meta.count}
                      </span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            }
          />

          {(Object.keys(tabMeta) as HighlightTab[]).map((key) => {
            const meta = tabMeta[key];
            return (
              <TabsContent key={key} value={key} className="mt-0">
                <AdminFilterRow>
                  <AdminSearchField>
                    <Search />
                    <Input
                      placeholder="Search products…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="admin-input"
                    />
                  </AdminSearchField>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="admin-select-trigger md:w-[200px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <label className="flex items-center gap-2 whitespace-nowrap font-body text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={showFlaggedOnly}
                      onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                      className="h-4 w-4 accent-gold-light"
                    />
                    Flagged only
                  </label>
                </AdminFilterRow>

                <AdminBulkBar className="mb-4">
                  <span className="font-body text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{selectedIds.size}</span>{" "}
                    selected
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-border-subtle"
                      disabled={bulkLoading}
                      onClick={bulk.enable}
                    >
                      {bulk.enableLabel}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-border-subtle"
                      disabled={bulkLoading}
                      onClick={bulk.disable}
                    >
                      {bulk.disableLabel}
                    </Button>
                    {key === "sale" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full border-border-subtle"
                        disabled={bulkLoading}
                        onClick={() => setCategorySaleOpen(true)}
                      >
                        Mark category on sale
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      disabled={bulkLoading}
                      onClick={() => void runBulkAction("clear_highlights")}
                    >
                      Clear all flags
                    </Button>
                  </div>
                </AdminBulkBar>

                {loading ? (
                  <AdminLoading label="Loading products…" />
                ) : filteredProducts.length === 0 ? (
                  <AdminEmptyState
                    title={meta.emptyTitle}
                    description={meta.emptyDescription}
                    icon={meta.icon}
                    action={
                      showFlaggedOnly ? (
                        <Button
                          variant="outline"
                          className="rounded-full"
                          onClick={() => setShowFlaggedOnly(false)}
                        >
                          Show all products
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <AdminTable>
                    <AdminTableHead>
                      <AdminTr>
                        <AdminTh className="w-10">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            aria-label="Select all"
                            className="h-4 w-4 accent-gold-light"
                          />
                        </AdminTh>
                        <AdminTh>Product</AdminTh>
                        <AdminTh>Price</AdminTh>
                        {key === "sale" && <AdminTh>Sale details</AdminTh>}
                        <AdminTh className="w-24 text-center">{meta.flagLabel}</AdminTh>
                        <AdminTh className="w-28">Actions</AdminTh>
                      </AdminTr>
                    </AdminTableHead>
                    <AdminTableBody>
                      {filteredProducts.map((product) => {
                        const primaryImage =
                          product.product_images?.find((img) => img.is_primary) ||
                          product.product_images?.[0];
                        const isFlagged = productMatchesTab(product, key);
                        const draft = saleDrafts[product.id] ?? saleDraftFromProduct(product);
                        const salePrice = isSaleWindowActive(product)
                          ? computeSalePricePkr(product)
                          : null;

                        return (
                          <AdminTr key={product.id}>
                            <AdminTd>
                              <input
                                type="checkbox"
                                checked={selectedIds.has(product.id)}
                                onChange={() => toggleSelected(product.id)}
                                aria-label={`Select ${product.name}`}
                                className="h-4 w-4 accent-gold-light"
                              />
                            </AdminTd>
                            <AdminTd>
                              <div className="flex items-center gap-3">
                                {primaryImage && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={primaryImage.url}
                                    alt=""
                                    className="h-11 w-11 rounded-xl border border-border-subtle/60 object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-body font-semibold">{product.name}</p>
                                  {product.categories?.name && (
                                    <p className="font-body text-xs text-muted-foreground">
                                      {product.categories.name}
                                    </p>
                                  )}
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {product.on_sale && isSaleWindowActive(product) && (
                                      <AdminStatusBadge
                                        variant="outline"
                                        className="border-ocean-mid/40 bg-ocean-primary/20 text-ocean-light"
                                      >
                                        Sale
                                      </AdminStatusBadge>
                                    )}
                                    {product.is_trending && (
                                      <AdminStatusBadge className="bg-ocean-mid text-primary-foreground">
                                        Trending
                                      </AdminStatusBadge>
                                    )}
                                    {product.is_premium && (
                                      <AdminStatusBadge className="bg-gold-light text-ocean-deep">
                                        Premium
                                      </AdminStatusBadge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AdminTd>
                            <AdminTd>
                              <p className="font-display font-semibold">
                                {formatPKR(product.price_pkr)}
                              </p>
                              {salePrice != null && salePrice < product.price_pkr && (
                                <p className="font-body text-xs text-ocean-light">
                                  Sale: {formatPKR(salePrice)}
                                </p>
                              )}
                            </AdminTd>
                            {key === "sale" && (
                              <AdminTd>
                                <div className="grid max-w-md gap-2 sm:grid-cols-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="Discount %"
                                    value={draft.discount_percent}
                                    onChange={(e) =>
                                      setSaleDrafts((prev) => ({
                                        ...prev,
                                        [product.id]: {
                                          ...draft,
                                          discount_percent: e.target.value,
                                        },
                                      }))
                                    }
                                    className="admin-input h-9 rounded-full text-sm"
                                    disabled={savingId === product.id}
                                  />
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Sale price PKR"
                                    value={draft.sale_price}
                                    onChange={(e) =>
                                      setSaleDrafts((prev) => ({
                                        ...prev,
                                        [product.id]: {
                                          ...draft,
                                          sale_price: e.target.value,
                                        },
                                      }))
                                    }
                                    className="admin-input h-9 rounded-full text-sm"
                                    disabled={savingId === product.id}
                                  />
                                  <Input
                                    type="datetime-local"
                                    value={draft.sale_start_at}
                                    onChange={(e) =>
                                      setSaleDrafts((prev) => ({
                                        ...prev,
                                        [product.id]: {
                                          ...draft,
                                          sale_start_at: e.target.value,
                                        },
                                      }))
                                    }
                                    className="admin-input h-9 rounded-full text-sm"
                                    disabled={savingId === product.id}
                                  />
                                  <Input
                                    type="datetime-local"
                                    value={draft.sale_end_at}
                                    onChange={(e) =>
                                      setSaleDrafts((prev) => ({
                                        ...prev,
                                        [product.id]: {
                                          ...draft,
                                          sale_end_at: e.target.value,
                                        },
                                      }))
                                    }
                                    className="admin-input h-9 rounded-full text-sm"
                                    disabled={savingId === product.id}
                                  />
                                </div>
                              </AdminTd>
                            )}
                            <AdminTd className="text-center">
                              <ToggleSwitch
                                id={`flag-${product.id}`}
                                checked={isFlagged}
                                onChange={(checked) => void handleTabToggle(product, checked)}
                                disabled={savingId === product.id}
                                label={`Toggle ${meta.flagLabel} for ${product.name}`}
                              />
                            </AdminTd>
                            <AdminTd>
                              <div className="flex flex-col gap-1">
                                {key === "sale" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-full text-xs"
                                    disabled={savingId === product.id}
                                    onClick={() => void saveSaleDetails(product)}
                                  >
                                    Save sale
                                  </Button>
                                )}
                                <Link
                                  href={`/admin/products/${product.id}/edit`}
                                  className="font-body text-xs text-ocean-light hover:underline"
                                >
                                  Edit product
                                </Link>
                              </div>
                            </AdminTd>
                          </AdminTr>
                        );
                      })}
                    </AdminTableBody>
                  </AdminTable>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </AdminCard>

      <Dialog open={categorySaleOpen} onOpenChange={setCategorySaleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark category on sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="font-body text-sm text-muted-foreground">
              Apply a sale discount to every active product in a category.
            </p>
            <div className="space-y-2">
              <Label htmlFor="bulk_category">Category</Label>
              <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                <SelectTrigger id="bulk_category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category_discount">Discount percent</Label>
              <Input
                id="category_discount"
                type="number"
                min="1"
                max="100"
                value={bulkDiscount}
                onChange={(e) => setBulkDiscount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCategorySaleOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={bulkLoading || !bulkCategoryId}
                onClick={() =>
                  void runBulkAction("mark_on_sale", {
                    categoryId: bulkCategoryId,
                    discountPercent: parseInt(bulkDiscount, 10) || 20,
                  })
                }
              >
                Apply to category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

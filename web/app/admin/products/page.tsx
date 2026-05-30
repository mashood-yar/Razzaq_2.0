"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPKR, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Plus as PlusIcon, Minus as MinusIcon, Package } from "lucide-react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { Product, ProductImage } from "@/lib/types";
import {
  AdminPageHeader,
  AdminCard,
  AdminBulkBar,
  AdminFilterRow,
  AdminSearchField,
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

export default function ProductsPage() {
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [products, setProducts] = useState<(Product & { product_images: ProductImage[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);
  const [bulkDiscount, setBulkDiscount] = useState("20");
  const [bulkScope, setBulkScope] = useState<"selected" | "category">("selected");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setProducts([]);
      setLoading(false);
      return;
    }
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          categories:category_id(name),
          product_images(url, is_primary)
        `);

      if (categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query.order(sortBy === "price" ? "price_pkr" : sortBy === "stock" ? "stock_quantity" : "name", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [supabase, categoryFilter, search, sortBy]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("categories")
      .select("id, name")
      .order("sort_order")
      .then(({ data }) => setCategories(data || []));
  }, [supabase]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, search, sortBy]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStockUpdate = async (productId: string, delta: number) => {
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to update stock");
      await fetchProducts();
      toast.success("Stock updated");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update stock");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.product || !supabase) return;
    try {
      const { error } = await supabase
        .from("products")
        .update({ status: "archived" })
        .eq("id", deleteDialog.product.id);
      if (error) throw error;
      toast.success("Product deleted (archived)");
      setDeleteDialog({ open: false, product: null });
      fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product");
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = displayedProducts.map((p) => p.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const runBulkAction = async (
    action: "mark_on_sale" | "mark_trending" | "mark_premium" | "clear_sale" | "clear_highlights",
    extra?: { discountPercent?: number },
  ) => {
    setBulkLoading(true);
    try {
      const body: Record<string, unknown> = { action };
      if (bulkScope === "selected") {
        if (selectedIds.size === 0) {
          toast.error("Select at least one product");
          return;
        }
        body.productIds = Array.from(selectedIds);
      } else if (categoryFilter !== "all") {
        body.categoryId = categoryFilter;
      } else {
        toast.error("Choose a category filter to apply bulk actions to a group");
        return;
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
      setSaleDialogOpen(false);
      await fetchProducts();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const filteredProducts = products;
  const totalPages = Math.ceil(filteredProducts.length / 10);
  const displayedProducts = filteredProducts.slice((page - 1) * 10, page * 10);
  const pageAllSelected =
    displayedProducts.length > 0 &&
    displayedProducts.every((p) => selectedIds.has(p.id));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        subtitle="Manage your product inventory"
        breadcrumb="Catalog"
        action={
          <Link href="/admin/products/new">
            <Button className="admin-btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        }
      />

      <AdminCard>
        <AdminFilterRow>
          <AdminSearchField>
            <Search />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
            />
          </AdminSearchField>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="admin-select-trigger">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="admin-select-trigger">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
            </SelectContent>
          </Select>
        </AdminFilterRow>

        <AdminBulkBar className="mb-4">
          <div className="flex flex-wrap items-center gap-2 font-body text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{selectedIds.size}</span> selected
            <Select value={bulkScope} onValueChange={(v) => setBulkScope(v as "selected" | "category")}>
              <SelectTrigger className="h-8 w-[160px] rounded-full border-border-subtle bg-ocean-deep/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="selected">Selected items</SelectItem>
                <SelectItem value="category">Current category</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="rounded-full border-border-subtle" disabled={bulkLoading} onClick={() => setSaleDialogOpen(true)}>
              Mark on sale
            </Button>
            <Button size="sm" variant="outline" className="rounded-full border-border-subtle" disabled={bulkLoading} onClick={() => void runBulkAction("mark_trending")}>
              Mark trending
            </Button>
            <Button size="sm" variant="outline" className="rounded-full border-border-subtle" disabled={bulkLoading} onClick={() => void runBulkAction("mark_premium")}>
              Mark premium
            </Button>
            <Button size="sm" variant="outline" className="rounded-full border-border-subtle" disabled={bulkLoading} onClick={() => void runBulkAction("clear_sale")}>
              Clear sale
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" disabled={bulkLoading} onClick={() => void runBulkAction("clear_highlights")}>
              Clear all flags
            </Button>
          </div>
        </AdminBulkBar>

        {loading ? (
          <AdminLoading label="Loading products…" />
        ) : displayedProducts.length === 0 ? (
          <AdminEmptyState
            title="No products found"
            description="Try adjusting filters or add a new product."
            icon={Package}
            action={
              <Link href="/admin/products/new">
                <Button className="admin-btn-primary">Add Product</Button>
              </Link>
            }
          />
        ) : (
          <AdminTable>
            <AdminTableHead>
              <AdminTr>
                <AdminTh className="w-12 text-center">
                  <input
                    type="checkbox"
                    checked={pageAllSelected}
                    onChange={toggleSelectAllOnPage}
                    aria-label="Select all on page"
                    className="h-4 w-4 accent-gold-light"
                  />
                </AdminTh>
                <AdminTh className="w-[26%]">Product</AdminTh>
                <AdminTh className="w-[10%]">SKU</AdminTh>
                <AdminTh className="admin-th-right w-[10%]">Price</AdminTh>
                <AdminTh className="w-[14%]">Highlights</AdminTh>
                <AdminTh className="admin-th-center w-[12%]">Stock</AdminTh>
                <AdminTh className="admin-th-center w-[10%]">Status</AdminTh>
                <AdminTh className="admin-th-center w-[10%]">Actions</AdminTh>
              </AdminTr>
            </AdminTableHead>
            <AdminTableBody>
                {displayedProducts.map((product) => {
                  const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0];
                  return (
                    <AdminTr key={product.id}>
                      <AdminTd className="admin-td-center">
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
                            // eslint-disable-next-line @next/next/no-img-element -- product images from arbitrary CDNs
                            <img
                              src={primaryImage.url}
                              alt={product.name}
                              className="h-12 w-12 shrink-0 rounded-xl border border-border-subtle/60 object-cover"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-body font-semibold">{product.name}</p>
                            {product.categories?.name && (
                              <p className="truncate font-body text-xs text-muted-foreground">{product.categories.name}</p>
                            )}
                          </div>
                        </div>
                      </AdminTd>
                      <AdminTd className="font-body text-sm">{product.sku || "—"}</AdminTd>
                      <AdminTd className="admin-td-right font-display font-semibold">{formatPKR(product.price_pkr)}</AdminTd>
                      <AdminTd>
                        <div className="flex flex-wrap gap-1">
                          {product.on_sale && (
                            <AdminStatusBadge variant="outline" className="border-ocean-mid/40 bg-ocean-primary/20 text-ocean-light">Sale</AdminStatusBadge>
                          )}
                          {product.is_trending && (
                            <AdminStatusBadge className="bg-ocean-mid text-primary-foreground">Trending</AdminStatusBadge>
                          )}
                          {product.is_premium && (
                            <AdminStatusBadge className="bg-gold-light text-ocean-deep">Premium</AdminStatusBadge>
                          )}
                          {!product.on_sale && !product.is_trending && !product.is_premium && (
                            <span className="font-body text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </AdminTd>
                      <AdminTd className="admin-td-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => handleStockUpdate(product.id, -1)}
                            disabled={product.stock_quantity <= 0}
                            aria-label="Decrease stock"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-body font-semibold tabular-nums">{product.stock_quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full"
                            onClick={() => handleStockUpdate(product.id, 1)}
                            aria-label="Increase stock"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </AdminTd>
                      <AdminTd className="admin-td-center">
                        <AdminStatusBadge className={STATUS_COLORS[product.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[product.status as keyof typeof STATUS_LABELS] || product.status}
                        </AdminStatusBadge>
                      </AdminTd>
                      <AdminTd className="admin-td-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-ocean-primary/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-destructive/15"
                            onClick={() => setDeleteDialog({ open: true, product })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </AdminTd>
                    </AdminTr>
                  );
                })}
            </AdminTableBody>
          </AdminTable>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" className="rounded-full border-border-subtle" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              Previous
            </Button>
            <span className="font-body text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button variant="outline" className="rounded-full border-border-subtle" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        )}
      </AdminCard>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete &quot;{deleteDialog.product?.name}&quot;? This will archive the product (soft delete).</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" className="admin-btn-outline" onClick={() => setDeleteDialog({ open: false, product: null })}>
              Cancel
            </Button>
            <Button className="admin-btn-destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark products on sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Apply a discount to {bulkScope === "selected" ? "selected products" : "all products in the current category filter"}.
            </p>
            <div className="space-y-2">
              <Label htmlFor="bulk_discount">Discount percent</Label>
              <Input
                id="bulk_discount"
                type="number"
                min="1"
                max="100"
                value={bulkDiscount}
                onChange={(e) => setBulkDiscount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSaleDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={bulkLoading}
                onClick={() =>
                  void runBulkAction("mark_on_sale", {
                    discountPercent: parseInt(bulkDiscount, 10) || 0,
                  })
                }
              >
                Apply sale
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

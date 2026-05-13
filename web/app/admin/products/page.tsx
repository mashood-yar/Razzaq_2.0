"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPKR, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Plus as PlusIcon, Minus as MinusIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product, ProductImage } from "@/lib/types";

const CATEGORIES = ["Fragrances", "Lawn", "Formal", "Casual", "Accessories"];

export default function ProductsPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<(Product & { product_images: ProductImage[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          categories:category_id(name),
          product_images(url, is_primary)
        `);

      if (categoryFilter !== "all") {
        query = query.eq("categories.name", categoryFilter);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      const { data, error } = await query.order(sortBy === "price" ? "price_pkr" : sortBy === "stock" ? "stock_quantity" : "name", { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, search, sortBy]);

  const handleStockUpdate = async (productId: string, delta: number) => {
    try {
      const { error } = await supabase.rpc("decrement_product_stock", {
        p_product_id: productId,
        p_qty: delta,
      });
      if (error) throw error;
      await fetchProducts();
      toast.success("Stock updated");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.product) return;
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

  const filteredProducts = products;
  const totalPages = Math.ceil(filteredProducts.length / 10);
  const displayedProducts = filteredProducts.slice((page - 1) * 10, page * 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            <p>No products yet</p>
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock">Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : displayedProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Product</th>
                  <th className="text-left p-3 font-medium">SKU</th>
                  <th className="text-left p-3 font-medium">Price</th>
                  <th className="text-left p-3 font-medium">Stock</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedProducts.map((product) => {
                  const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0];
                  return (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {primaryImage && (
                            <img
                              src={primaryImage.url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">No products found</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{product.sku || "-"}</td>
                      <td className="p-3">{formatPKR(product.price_pkr)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleStockUpdate(product.id, -1)}
                            disabled={product.stock_quantity <= 0}
                          >
                            <MinusIcon className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{product.stock_quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleStockUpdate(product.id, 1)}
                          >
                            <PlusIcon className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className={STATUS_COLORS[product.status as keyof typeof STATUS_COLORS]}>
                          {STATUS_LABELS[product.status as keyof typeof STATUS_LABELS] || product.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog({ open: true, product })}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete &quot;{deleteDialog.product?.name}&quot;? This will archive the product (soft delete).</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, product: null })}>
              Cancel
            </Button>
            <Button variant="default" className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

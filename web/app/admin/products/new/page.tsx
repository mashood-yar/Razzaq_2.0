"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { X, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import type { Category } from "@/lib/types";
import {
  ADMIN_PRODUCT_IMAGE_MAX_BYTES,
  formatImageUploadFetchError,
} from "@/lib/admin/product-image-upload";
import {
  AdminPageHeader,
  AdminCard,
  AdminFormSection,
  AdminImageDropzone,
} from "@/components/admin/admin-ui";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  sku: z.string().optional(),
  price_pkr: z.string().min(1, "Price is required"),
  stock_quantity: z.string().min(1, "Stock is required"),
  category_id: z.string().uuid("Select a category"),
  status: z.enum(["draft", "active", "archived"]),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const router = useRouter();
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [loading, setLoading] = useState(false);
  const [pendingImageUploads, setPendingImageUploads] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    sku: "",
    price_pkr: "",
    stock_quantity: "0",
    category_id: "",
    status: "draft",
  });
  const [images, setImages] = useState<{ file: File; preview: string; url: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, [supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
    maxSize: ADMIN_PRODUCT_IMAGE_MAX_BYTES,
    disabled: loading,
    onDropRejected: (rejections) => {
      for (const { file, errors } of rejections) {
        const tooBig = errors.some((e) => e.code === "file-too-large");
        const msg = tooBig
          ? `Too large (max ${ADMIN_PRODUCT_IMAGE_MAX_BYTES / (1024 * 1024)} MB)`
          : errors.map((e) => e.message).join(", ") || "File rejected";
        toast.error(`${file.name}: ${msg}`);
      }
    },
    onDrop: async (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        url: "",
      }));
      setImages((prev) => [...prev, ...newImages]);

      setPendingImageUploads((n) => n + newImages.length);

      // Upload to Cloudinary once per file (submit only sends returned URLs to Supabase)
      for (const img of newImages) {
        const formData = new FormData();
        formData.append("file", img.file);
        try {
          const res = await fetch("/api/admin/upload-image", {
            method: "POST",
            credentials: "include",
            body: formData,
            signal: AbortSignal.timeout(120_000),
          });
          const payload = (await res.json().catch(() => ({}))) as {
            url?: string;
            error?: string;
          };
          if (!res.ok || !payload.url) {
            const msg =
              typeof payload.error === "string"
                ? payload.error
                : "Upload failed";
            throw new Error(msg);
          }
          setImages((prev) =>
            prev.map((i) =>
              i.preview === img.preview ? { ...i, url: payload.url! } : i
            )
          );
        } catch (e) {
          toast.error(`${img.file.name}: ${formatImageUploadFetchError(e, img.file.name)}`);
        } finally {
          setPendingImageUploads((n) => Math.max(0, n - 1));
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!supabase) {
      toast.error("Supabase is not configured.");
      setLoading(false);
      return;
    }

    try {
      if (pendingImageUploads > 0) {
        toast.error("Wait for all image uploads to finish before creating the product.");
        return;
      }
      const stuckLocal = images.some((img) => img.file && !img.url?.trim());
      if (stuckLocal) {
        toast.error("Some images failed to upload or are still pending. Remove them or re-add files.");
        return;
      }

      const validated = productSchema.parse(formData);
      const categoryId = validated.category_id;

      /** Only Cloudinary HTTPS URLs — never re-send File blobs on submit */
      const imagePayload = images
        .filter((img) => typeof img.url === "string" && img.url.trim().length > 0)
        .map((img) => ({ url: img.url.trim() }));

      const skuTrimmed = validated.sku?.trim() ?? "";

      const controller = new AbortController();
      const abortTimer = setTimeout(() => controller.abort(), 10_000);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          name: validated.name,
          description: validated.description,
          ...(skuTrimmed.length > 0 ? { sku: skuTrimmed } : {}),
          price_pkr: parseFloat(validated.price_pkr),
          stock_quantity: parseInt(validated.stock_quantity, 10),
          category_id: categoryId,
          status: validated.status,
          images: imagePayload,
        }),
      }).finally(() => clearTimeout(abortTimer));

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
      };

      if (!res.ok) {
        const msg =
          typeof payload.error === "string"
            ? payload.error
            : "Failed to create product";
        throw new Error(msg);
      }

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error: unknown) {
      const isAbort =
        (error instanceof DOMException && error.name === "AbortError") ||
        (error instanceof Error && error.name === "AbortError");
      if (isAbort) {
        toast.error(
          "Request timed out after 10 seconds. See the terminal for Supabase/logs or try again.",
        );
      } else if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to create product");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (preview: string) => {
    setImages((prev) => prev.filter((img) => img.preview !== preview));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <AdminPageHeader
        title="Add Product"
        subtitle="Create a new product for your store"
        breadcrumb="Catalog"
        backHref="/admin/products"
        backLabel="Products"
      />

      <AdminCard padding="lg">
        <form onSubmit={handleSubmit} className="space-y-8">
          <AdminFormSection title="Basic information" description="Core product details visible on the storefront.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-body">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
                className="admin-input rounded-full"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU (optional)</Label>
              <Input
                id="sku"
                placeholder="Leave blank to auto-generate"
                value={formData.sku ?? ""}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                disabled={loading}
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_pkr">Price (PKR) *</Label>
              <Input
                id="price_pkr"
                type="number"
                step="0.01"
                value={formData.price_pkr}
                onChange={(e) => setFormData({ ...formData, price_pkr: e.target.value })}
                disabled={loading}
              />
              {errors.price_pkr && <p className="text-sm text-destructive">{errors.price_pkr}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                disabled={loading}
              />
              {errors.stock_quantity && <p className="text-sm text-destructive">{errors.stock_quantity}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
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
              {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-body">Description *</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
              className="rounded-2xl border-border-subtle bg-ocean-deep/50 font-body"
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="font-body">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as ProductFormData["status"],
                })
              }
              disabled={loading}
            >
              <SelectTrigger id="status" className="rounded-full border-border-subtle bg-ocean-deep/50">
                <SelectValue placeholder="Draft" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft (not on storefront)</SelectItem>
                <SelectItem value="active">Active (visible on store)</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
          </div>
          </AdminFormSection>

          <AdminFormSection title="Product images" description="Upload high-quality images. The first image becomes primary.">
            <AdminImageDropzone
              isDragActive={isDragActive}
              disabled={loading}
              rootProps={getRootProps()}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-2 h-12 w-12 text-ocean-light" />
              <p className="font-body text-sm text-muted-foreground">
                {isDragActive ? "Drop images here" : "Drag & drop images, or click to select"}
              </p>
              <p className="mt-1 font-body text-xs text-muted-foreground">PNG, JPG, JPEG, WebP</p>
              {pendingImageUploads > 0 && (
                <p className="mt-2 flex items-center justify-center gap-2 font-body text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  Uploading {pendingImageUploads} image{pendingImageUploads === 1 ? "" : "s"}…
                </p>
              )}
            </AdminImageDropzone>

            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {images.map((img, idx) => (
                  <div key={img.preview} className="group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- blob: object URL preview */}
                    <img
                      src={img.preview}
                      alt={`Preview ${idx + 1}`}
                      className="h-32 w-full rounded-xl border border-border-subtle/60 object-cover"
                    />
                    {idx === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-gold-light px-2 py-0.5 font-body text-[10px] font-bold text-ocean-deep">
                        Primary
                      </span>
                    )}
                    {!img.url && (
                      <span className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 rounded-lg bg-ocean-deep/90 py-1 font-body text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                        Uploading…
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(img.preview)}
                      className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </AdminFormSection>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="admin-btn-primary"
              disabled={loading || pendingImageUploads > 0}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                  Creating…
                </>
              ) : (
                "Create Product"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="admin-btn-outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}

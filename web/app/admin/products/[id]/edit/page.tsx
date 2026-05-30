"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDropzone } from "react-dropzone";
import { X, Upload, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import type { Product, ProductImage, Category } from "@/lib/types";
import {
  ADMIN_PRODUCT_IMAGE_MAX_BYTES,
  formatImageUploadFetchError,
} from "@/lib/admin/product-image-upload";
import {
  ProductHighlightsFields,
  defaultHighlightFormState,
  highlightPayloadFromForm,
  highlightStateFromProduct,
  type ProductHighlightFormState,
} from "@/components/admin/product-highlights-fields";
import {
  AdminPageHeader,
  AdminCard,
  AdminFormSection,
  AdminImageDropzone,
  AdminLoading,
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingImageUploads, setPendingImageUploads] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
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
  const [images, setImages] = useState<{ id?: string; file?: File; preview: string; url: string; is_primary: boolean }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [highlights, setHighlights] = useState<ProductHighlightFormState>(defaultHighlightFormState);

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const [productRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(name), product_images(*)")
          .eq("id", params.id)
          .single(),
        supabase.from("categories").select("*").order("sort_order"),
      ]);

      if (productRes.data) {
        const p = productRes.data;
        const st = p.status === "active" || p.status === "archived" ? p.status : "draft";
        setProduct(p);
        setFormData({
          name: p.name,
          description: p.description || "",
          sku: p.sku || "",
          price_pkr: p.price_pkr.toString(),
          stock_quantity: p.stock_quantity.toString(),
          category_id: p.category_id || "",
          status: st,
        });
        setHighlights(highlightStateFromProduct(p));
        setImages(
          productRes.data.product_images?.map((img: ProductImage) => ({
            id: img.id,
            preview: img.url,
            url: img.url,
            is_primary: img.is_primary,
          })) || []
        );
      }

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      setLoading(false);
    };

    loadData();
  }, [params.id, supabase]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
    maxSize: ADMIN_PRODUCT_IMAGE_MAX_BYTES,
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
        is_primary: false,
      }));
      setImages((prev) => [...prev, ...newImages]);
      setPendingImageUploads((n) => n + newImages.length);

      for (const img of newImages) {
        const formData = new FormData();
        formData.append("file", img.file!);
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
          toast.error(`${img.file!.name}: ${formatImageUploadFetchError(e, img.file!.name)}`);
        } finally {
          setPendingImageUploads((n) => Math.max(0, n - 1));
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    if (!supabase) {
      toast.error("Supabase is not configured.");
      setSaving(false);
      return;
    }

    try {
      if (pendingImageUploads > 0) {
        toast.error("Wait for all image uploads to finish before saving.");
        return;
      }
      const stuckLocal = images.some((img) => img.file && !img.url?.trim());
      if (stuckLocal) {
        toast.error("Some images failed to upload or are still pending. Remove them or re-add files.");
        return;
      }

      const validated = productSchema.parse(formData);
      const categoryId = validated.category_id;

      const skuTrimmed = validated.sku?.trim() ?? "";
      const skuFinal =
        skuTrimmed.length > 0
          ? skuTrimmed
          : product?.sku ??
            `SKU-${crypto.randomUUID().replace(/-/g, "").slice(0, 14)}`;

      const { error: productError } = await supabase
        .from("products")
        .update({
          name: validated.name,
          description: validated.description,
          sku: skuFinal,
          price_pkr: parseFloat(validated.price_pkr),
          stock_quantity: parseInt(validated.stock_quantity, 10),
          category_id: categoryId,
          status: validated.status,
          ...highlightPayloadFromForm(highlights),
        })
        .eq("id", params.id);

      if (productError) throw productError;

      // Handle images - delete removed, add new, update primary
      const existingImageIds = product?.product_images?.map((img) => img.id) || [];
      const currentImageIds = images.filter((img) => img.id).map((img) => img.id!);
      const imagesToDelete = existingImageIds.filter((id) => !currentImageIds.includes(id));

      // Delete removed images from Supabase and Cloudinary
      for (const imageId of imagesToDelete) {
        await supabase.from("product_images").delete().eq("id", imageId);
        await fetch("/api/admin/delete-image", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageId }),
        });
      }

      // Insert new images
      const newImages = images.filter((img) => !img.id && img.url);
      if (newImages.length > 0) {
        const imageInserts = newImages.map((img, idx) => ({
          product_id: params.id,
          url: img.url,
          is_primary: img.is_primary,
          sort_order: images.length + idx,
        }));
        await supabase.from("product_images").insert(imageInserts);
      }

      // Update primary flag for existing images
      for (const img of images) {
        if (img.id) {
          await supabase
            .from("product_images")
            .update({ is_primary: img.is_primary })
            .eq("id", img.id);
        }
      }

      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toast.error(error instanceof Error ? error.message : "Failed to update product");
      }
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async (index: number) => {
    const img = images[index];
    if (img.id) {
      // Delete from Cloudinary
      await fetch("/api/admin/delete-image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageId: img.id }),
      });
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === index })));
  };

  if (loading) {
    return <AdminLoading label="Loading product…" />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0 hover:bg-ocean-primary/15"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AdminPageHeader
          title="Edit Product"
          subtitle={product?.name ?? "Update product information"}
          breadcrumb="Catalog"
        />
      </div>

      <AdminCard padding="lg">
        <form onSubmit={handleSubmit} className="space-y-8">
          <AdminFormSection title="Basic information">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-body">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={saving}
                className="admin-input rounded-full"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                placeholder="Leave blank to keep current or auto-generate"
                value={formData.sku ?? ""}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                disabled={saving}
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
                disabled={saving}
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
                disabled={saving}
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={saving}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as ProductFormData["status"],
                })
              }
              disabled={saving}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
          </div>
          </AdminFormSection>

          <ProductHighlightsFields
            value={highlights}
            onChange={setHighlights}
            disabled={saving}
          />

          <AdminFormSection title="Product images">
            <AdminImageDropzone
              isDragActive={isDragActive}
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
                      className="h-32 w-full cursor-pointer rounded-xl border border-border-subtle/60 object-cover"
                      onClick={() => setPrimaryImage(idx)}
                    />
                    {img.is_primary && (
                      <span className="absolute left-2 top-2 rounded-full bg-gold-light px-2 py-0.5 font-body text-[10px] font-bold text-ocean-deep">
                        Primary
                      </span>
                    )}
                    {!img.url && img.file && (
                      <span className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1 rounded-lg bg-ocean-deep/90 py-1 font-body text-xs">
                        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                        Uploading…
                      </span>
                    )}
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className="rounded-full bg-gold-light p-1 text-ocean-deep"
                        title="Set as primary"
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="rounded-full bg-destructive p-1 text-white"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminFormSection>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="admin-btn-primary" disabled={saving || pendingImageUploads > 0}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" className="admin-btn-outline" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      </AdminCard>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { X, Upload, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import type { Product, ProductImage, Category } from "@/lib/types";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  sku: z.string().min(1, "SKU is required"),
  price_pkr: z.string().min(1, "Price is required"),
  stock_quantity: z.string().min(1, "Stock is required"),
  category_id: z.string().min(1, "Category is required"),
  weight_kg: z.string().optional(),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    sku: "",
    price_pkr: "",
    stock_quantity: "0",
    category_id: "",
    weight_kg: "",
    is_active: true,
  });
  const [images, setImages] = useState<{ id?: string; file?: File; preview: string; url: string; is_primary: boolean }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      const [productRes, categoriesRes] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(name), product_images(*)")
          .eq("id", params.id)
          .single(),
        supabase.from("categories").select("*").order("sort_order"),
      ]);

      if (productRes.data) {
        setProduct(productRes.data);
        setFormData({
          name: productRes.data.name,
          description: productRes.data.description || "",
          sku: productRes.data.sku || "",
          price_pkr: productRes.data.price_pkr.toString(),
          stock_quantity: productRes.data.stock_quantity.toString(),
          category_id: productRes.data.categories?.name || "",
          weight_kg: productRes.data.weight_kg?.toString() || "",
          is_active: productRes.data.status === "active",
        });
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
    onDrop: async (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        url: "",
        is_primary: false,
      }));
      setImages((prev) => [...prev, ...newImages]);

      for (const img of newImages) {
        const formData = new FormData();
        formData.append("file", img.file);
        try {
          const res = await fetch("/api/admin/upload-image", {
            method: "POST",
            body: formData,
          });
          if (!res.ok) throw new Error("Upload failed");
          const data = await res.json();
          setImages((prev) =>
            prev.map((i) =>
              i.preview === img.preview ? { ...i, url: data.url } : i
            )
          );
        } catch {
          toast.error(`Failed to upload ${img.file.name}`);
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const validated = productSchema.parse(formData);
      const categoryId = categories.find((c) => c.name === formData.category_id)?.id || formData.category_id;

      const { error: productError } = await supabase
        .from("products")
        .update({
          name: validated.name,
          description: validated.description,
          sku: validated.sku,
          price_pkr: parseFloat(validated.price_pkr),
          stock_quantity: parseInt(validated.stock_quantity),
          category_id: categoryId,
          weight_kg: validated.weight_kg ? parseFloat(validated.weight_kg) : null,
          status: validated.is_active ? "active" : "draft",
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
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={saving}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
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
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-sm text-destructive">{errors.category_id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (KG)</Label>
              <Input
                id="weight_kg"
                type="number"
                step="0.1"
                value={formData.weight_kg}
                onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                disabled={saving}
              />
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
            <Label htmlFor="is_active">Status</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                disabled={saving}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm">Active (visible on store)</label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? "Drop images here" : "Drag & drop images, or click to select"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG, WebP</p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((img, idx) => (
                  <div key={img.preview} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${idx + 1}`}
                      className="w-full h-32 object-cover rounded cursor-pointer"
                      onClick={() => setPrimaryImage(idx)}
                    />
                    {img.is_primary && (
                      <span className="absolute top-1 left-1 bg-gold text-obsidian text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        className="bg-gold text-obsidian p-1 rounded"
                        title="Set as primary"
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="bg-destructive text-white p-1 rounded"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

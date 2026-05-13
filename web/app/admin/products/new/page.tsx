"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { z } from "zod";
import type { Category } from "@/lib/types";

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

export default function AddProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
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
  const [images, setImages] = useState<{ file: File; preview: string; url: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useState(() => {
    supabase.from("categories").select("*").order("sort_order").then(({ data }) => {
      if (data) setCategories(data);
    });
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    multiple: true,
    onDrop: async (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        url: "",
      }));
      setImages((prev) => [...prev, ...newImages]);

      // Upload to Cloudinary
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
    setLoading(true);
    setErrors({});

    try {
      const validated = productSchema.parse(formData);
      const categoryId = categories.find((c) => c.name === formData.category_id)?.id || formData.category_id;

      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name: validated.name,
          description: validated.description,
          sku: validated.sku,
          price_pkr: parseFloat(validated.price_pkr),
          stock_quantity: parseInt(validated.stock_quantity),
          category_id: categoryId,
          weight_kg: validated.weight_kg ? parseFloat(validated.weight_kg) : null,
          status: validated.is_active ? "active" : "draft",
        })
        .select()
        .single();

      if (productError) throw productError;

      // Insert images
      if (images.length > 0 && product) {
        const imageInserts = images.map((img, idx) => ({
          product_id: product.id,
          url: img.url,
          is_primary: idx === 0,
          sort_order: idx,
        }));
        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(imageInserts);
        if (imagesError) throw imagesError;
      }

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold">Add Product</h1>
        <p className="text-muted-foreground">Create a new product for your store</p>
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
                disabled={loading}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
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
                disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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
                      className="w-full h-32 object-cover rounded"
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-gold text-obsidian text-xs px-2 py-1 rounded">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(img.preview)}
                      className="absolute top-1 right-1 bg-destructive text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

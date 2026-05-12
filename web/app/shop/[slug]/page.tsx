import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";
import {
  getProductBySlug,
  getRelatedProducts,
  PRODUCTS,
} from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductAddForm } from "@/components/product/product-add-form";
import { NotePyramid } from "@/components/product/note-pyramid";
import { StarRating } from "@/components/product/star-rating";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCard } from "@/components/product/product-card";
import { Separator } from "@/components/ui/separator";
import { formatPKR } from "@/lib/utils";

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span>{value}/5</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-brand to-gold"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: p.tagline,
    openGraph: {
      title: `${p.name} · LUMINA`,
      description: p.tagline,
      images: [{ url: p.images[0], width: 1200, height: 1200, alt: p.name }],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug, 4);
  const mayAlso = PRODUCTS.filter((x) => x.slug !== slug).slice(0, 4);

  const badgeText =
    product.badge === "bestseller"
      ? "Bestseller"
      : product.badge === "new"
        ? "New arrival"
        : product.badge === "limited"
          ? "Limited edition"
          : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-8 rounded-xl border border-gold/20 bg-brand-mist/25 px-4 py-3 text-center text-sm text-muted-foreground backdrop-blur-sm">
        <Truck className="mr-2 inline-block h-4 w-4 text-gold" aria-hidden />
        Complimentary standard shipping on Pakistan orders over{" "}
        <span className="font-medium text-foreground">{formatPKR(5000)}</span>
      </div>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />
        <div>
          {badgeText && (
            <Badge className="mb-4 border-gold/40">{badgeText}</Badge>
          )}
          <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{product.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <StarRating rating={product.rating} className="gap-1" />
            <span className="text-sm text-muted-foreground">
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>
          <p className="mt-8 text-3xl font-medium text-gold">
            {formatPKR(product.price)}
            {product.compareAtPrice && (
              <span className="ml-3 text-lg text-muted-foreground line-through">
                {formatPKR(product.compareAtPrice)}
              </span>
            )}
          </p>

          <Separator className="my-10 bg-white/10" />

          <ProductAddForm product={product} />

          <Separator className="my-10 bg-white/10" />

          <div className="grid gap-6 sm:grid-cols-2">
            <Meter label="Longevity" value={product.longevity} />
            <Meter label="Sillage" value={product.sillage} />
          </div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="text-center font-serif text-3xl">Scent pyramid</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          How {product.name} unfolds on skin — from first touch to lasting impression.
        </p>
        <div className="mt-12">
          <NotePyramid product={product} />
        </div>
      </section>

      <section className="mt-24 grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-2xl">Description</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <h3 className="mt-10 font-serif text-xl">The story</h3>
          <p className="mt-3 leading-relaxed text-muted-foreground">{product.story}</p>
        </div>
        <div>
          <h2 className="font-serif text-2xl">Ingredients</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.ingredients}
          </p>
          <p className="mt-6 text-xs text-muted-foreground">
            For full allergen information refer to packaging insert.
          </p>
        </div>
      </section>

      <section className="mt-24 border-t border-white/10 pt-16">
        <ProductReviews productName={product.name} />
      </section>

      <section className="mt-24">
        <h2 className="font-serif text-3xl">Related</h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mt-24 border-t border-white/10 pt-16">
        <h2 className="font-serif text-3xl">You may also like</h2>
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {mayAlso.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <div className="mt-16 text-center">
        <Link
          href="/shop"
          className="text-sm uppercase tracking-[0.2em] text-gold hover:underline"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}

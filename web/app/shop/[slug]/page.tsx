import { redirect } from "next/navigation";

/** Legacy URLs — canonical PDP is `/products/[slug]` (Supabase-backed). */
export default async function ShopSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/products/${slug}`);
}

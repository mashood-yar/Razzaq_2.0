import { revalidatePath } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    _type?: string;
    slug?: { current?: string };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = body._type;
  const slug = body.slug?.current;

  switch (type) {
    case "product":
      revalidatePath("/shop");
      if (slug) {
        revalidatePath(`/shop/${slug}`);
        revalidatePath(`/products/${slug}`);
      }
      break;
    case "collection":
      revalidatePath("/");
      revalidatePath("/shop");
      break;
    case "legalPage":
      if (slug) revalidatePath(`/policies/${slug}`);
      break;
    case "blogPost":
      revalidatePath("/blog");
      if (slug) revalidatePath(`/blog/${slug}`);
      break;
    case "homepage":
      revalidatePath("/");
      break;
    case "about":
      revalidatePath("/about");
      break;
    default:
      revalidatePath("/");
  }

  return NextResponse.json({ revalidated: true });
}

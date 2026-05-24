import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";
import {
  cloudinaryErrorDiag,
  cloudinaryErrorMessage,
  configureCloudinaryAdmin,
  getCloudinaryAdminCredentials,
} from "@/lib/cloudinary-admin-config";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cfg = getCloudinaryAdminCredentials();
  if (!cfg.ok) {
    return NextResponse.json({ error: cfg.error }, { status: 503 });
  }

  configureCloudinaryAdmin(cfg.credentials);

  try {
    const body = await request.json();
    const { imageId } = body;

    if (!imageId) {
      return NextResponse.json({ error: "No image ID provided" }, { status: 400 });
    }

    const { data: imageData } = await supabase
      .from("product_images")
      .select("url")
      .eq("id", imageId)
      .single();

    if (!imageData) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const url = imageData.url;
    const publicId = url.split("/").slice(-1)[0]?.split(".")[0];
    if (publicId) {
      await cloudinary.uploader.destroy(`razzaq-luxe/products/${publicId}`);
    }

    await supabase.from("product_images").delete().eq("id", imageId);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const diag = cloudinaryErrorDiag(error);
    console.error("[delete-image]", diag);
    return NextResponse.json(
      { error: cloudinaryErrorMessage(error, "Failed to delete image") },
      { status: 502 },
    );
  }
}

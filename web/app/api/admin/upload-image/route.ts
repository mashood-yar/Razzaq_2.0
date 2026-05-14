import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { v2 as cloudinary } from "cloudinary";
import {
  cloudinaryErrorDiag,
  cloudinaryErrorMessage,
  getCloudinaryAdminCredentials,
} from "@/lib/cloudinary-admin-config";

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/jpg"]);

function sanitizeFileLabel(name: string): string {
  const base = name.replace(/[^\w.%-]+/g, "_").trim();
  return base.slice(0, 160) || "unnamed";
}

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

  const { cloudName, apiKey, apiSecret } = cfg.credentials;
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mime = (file.type || "").toLowerCase();
    console.info("[upload-image] start", {
      fileLabel: sanitizeFileLabel(file.name),
      sizeBytes: file.size,
      mime: mime || "(empty)",
      cloudConfigured: !!cloudName,
    });

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `Image too large (max ${MAX_BYTES / (1024 * 1024)} MB)` },
        { status: 413 },
      );
    }

    if (mime && !ALLOWED.has(mime)) {
      return NextResponse.json(
        { error: `Unsupported image type: ${mime || "unknown"}. Use PNG, JPEG, or WebP.` },
        { status: 415 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "razzaq-luxe/products", resource_type: "image" },
        (err: Error | undefined, res: { secure_url: string } | undefined) => {
          if (err) reject(err);
          else if (res) resolve(res);
          else reject(new Error("Cloudinary returned no result"));
        },
      ).end(buffer);
    });

    console.info("[upload-image] success", {
      fileLabel: sanitizeFileLabel(file.name),
      bytesOut: buffer.length,
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error: unknown) {
    const diag = cloudinaryErrorDiag(error);
    console.error("[upload-image] Cloudinary failure", diag);
    const message = cloudinaryErrorMessage(error);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
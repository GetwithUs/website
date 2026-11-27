import { put } from "@vercel/blob";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/features/admin/auth";
import { env } from "@/config/env";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

/** Admin only. Stores client logo/cover bytes in Vercel Blob. */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured" },
      { status: 503 },
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP and SVG images are allowed" },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be 4 MB or smaller" }, { status: 413 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Image is empty" }, { status: 400 });
  }

  const name = `clients/${crypto.randomUUID()}.${ext}`;
  const blob = await put(name, file, { access: "public", contentType: file.type });
  return NextResponse.json({ url: blob.url });
}

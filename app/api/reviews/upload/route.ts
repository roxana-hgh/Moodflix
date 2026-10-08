import { NextResponse } from "next/server";

import { prisma } from "@/services/db/prisma";
import { uploadImage } from "@/services/cloudinary/upload";
import { getCurrentUserId } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File) || !ALLOWED.has(file.type) || file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Invalid image (max 5MB, jpg/png/webp/gif)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { url, publicId } = await uploadImage(buffer, {
    folder: "moodflix/reviews",
    transformation: [{ width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }],
  });

  await prisma.reviewImage.create({ data: { userId, url, publicId } });
  return NextResponse.json({ url });
}
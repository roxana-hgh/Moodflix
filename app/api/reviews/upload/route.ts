import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { uploadImage } from "@/services/cloudinary/upload";
import { prisma } from "@/services/db/prisma";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadImage(buffer, {
      folder: "moodflix/reviews",
      transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
    });

    await prisma.reviewImage.create({ data: { userId, url, publicId } });
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[reviews/upload]", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
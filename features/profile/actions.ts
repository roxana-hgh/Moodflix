"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/services/db/prisma";
import { uploadImage, deleteImage } from "@/services/cloudinary/upload";
import { updateProfileSchema, imageUploadSchema, type UpdateProfileInput } from "./schema";



type ActionResult<T = undefined> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function getSessionUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function updateProfile(input: UpdateProfileInput): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      age: parsed.data.age ?? null,
      gender: parsed.data.gender ?? null,
      bio: parsed.data.bio ?? null,
    },
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = imageUploadSchema.safeParse({ file: formData.get("file") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid image" };
  }

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });

  const buffer = Buffer.from(await parsed.data.file.arrayBuffer());
  const { url, publicId } = await uploadImage(buffer, {
    folder: `moodflix/avatars/${userId}`,
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  });

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: url, avatarPublicId: publicId },
  });

  if (current?.avatarPublicId) await deleteImage(current.avatarPublicId).catch(() => {});

  revalidatePath("/profile");
  return { success: true, data: { url } };
}

export async function removeAvatar(): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPublicId: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null, avatarPublicId: null },
  });

  if (current?.avatarPublicId) await deleteImage(current.avatarPublicId).catch(() => {});

  revalidatePath("/profile");
  return { success: true };
}

export async function uploadBanner(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  const parsed = imageUploadSchema.safeParse({ file: formData.get("file") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid image" };
  }

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { bannerPublicId: true },
  });

  const buffer = Buffer.from(await parsed.data.file.arrayBuffer());
  const { url, publicId } = await uploadImage(buffer, {
    folder: `moodflix/banners/${userId}`,
    transformation: [{ width: 1200, height: 300, crop: "fill" }],
  });

  await prisma.user.update({
    where: { id: userId },
    data: { bannerUrl: url, bannerPublicId: publicId },
  });

  if (current?.bannerPublicId) await deleteImage(current.bannerPublicId).catch(() => {});

  revalidatePath("/profile");
  return { success: true, data: { url } };
}

export async function removeBanner(): Promise<ActionResult> {
  const userId = await getSessionUserId();
  if (!userId) return { success: false, error: "Not authenticated" };

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { bannerPublicId: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { bannerUrl: null, bannerPublicId: null },
  });

  if (current?.bannerPublicId) await deleteImage(current.bannerPublicId).catch(() => {});

  revalidatePath("/profile");
  return { success: true };
}
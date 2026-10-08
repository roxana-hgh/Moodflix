"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/lib/generated/prisma/client";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/services/db/prisma";
import { deleteImage } from "@/services/cloudinary/upload";
import { slugify } from "@/utils/slugify";
import { collectImageSrcs, extractPlainText, type TiptapNode } from "@/utils/tiptap";
import { commentInputSchema, saveReviewSchema } from "./schema";
import type { ActionResult } from "./types";

const UNAUTHORIZED = "Please sign in first.";

function revalidateReviewPaths(slug: string) {
  revalidatePath("/");
  revalidatePath("/reviews");
  revalidatePath(`/reviews/${slug}`);
  revalidatePath("/profile");
  revalidatePath("/profile/reviews");
}

// Links uploaded images to the review and removes images no longer used in the content
async function syncReviewImages(reviewId: string, userId: string, srcs: string[]) {
  if (srcs.length > 0) {
    await prisma.reviewImage.updateMany({
      where: { userId, url: { in: srcs } },
      data: { reviewId },
    });
  }

  const orphans = await prisma.reviewImage.findMany({
    where: { reviewId, url: { notIn: srcs } },
    select: { id: true, publicId: true },
  });
  if (orphans.length === 0) return;

  await Promise.allSettled(orphans.map((image) => deleteImage(image.publicId)));
  await prisma.reviewImage.deleteMany({ where: { id: { in: orphans.map((o) => o.id) } } });
}

export async function saveReview(raw: unknown): Promise<ActionResult<{ slug: string }>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const parsed = saveReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const { id, status, data } = parsed.data;

  const doc = data.content as TiptapNode;
  const imageSrcs = [...new Set(collectImageSrcs(doc))];

  // Only images uploaded by this user through /api/reviews/upload are allowed
  if (imageSrcs.length > 0) {
    const owned = await prisma.reviewImage.count({
      where: { userId, url: { in: imageSrcs } },
    });
    if (owned !== imageSrcs.length) return { ok: false, error: "Invalid image in content." };
  }

  const isSingle = data.type === "SINGLE";
  const fields = {
    type: data.type,
    status,
    title: data.title,
    hasSpoilers: data.hasSpoilers,
    loved: data.loved,
    disliked: data.disliked,
    excerpt: extractPlainText(doc).slice(0, 220),
    coverUrl: imageSrcs[0] ?? null,
    content: data.content as Prisma.InputJsonValue,
    overall: isSingle ? (data.overall ?? null) : null,
    directing: isSingle ? (data.directing ?? null) : null,
    acting: isSingle ? (data.acting ?? null) : null,
    screenplay: isSingle ? (data.screenplay ?? null) : null,
    visuals: isSingle ? (data.visuals ?? null) : null,
    music: isSingle ? (data.music ?? null) : null,
  };
  const mediaRows = data.media.map((item, position) => ({ ...item, position }));

  if (id) {
    const existing = await prisma.review.findFirst({
      where: { id, userId },
      select: { slug: true, publishedAt: true },
    });
    if (!existing) return { ok: false, error: "Review not found." };

    await prisma.$transaction([
      prisma.reviewMedia.deleteMany({ where: { reviewId: id } }),
      prisma.review.update({
        where: { id },
        data: {
          ...fields,
          publishedAt:
            status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
          media: { create: mediaRows },
        },
      }),
    ]);
    await syncReviewImages(id, userId, imageSrcs);
    revalidateReviewPaths(existing.slug);
    return { ok: true, data: { slug: existing.slug } };
  }

  const slug = `${slugify(data.title) || "review"}-${crypto.randomUUID().slice(0, 6)}`;
  const created = await prisma.review.create({
    data: {
      ...fields,
      slug,
      userId,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      media: { create: mediaRows },
    },
    select: { id: true },
  });
  await syncReviewImages(created.id, userId, imageSrcs);
  revalidateReviewPaths(slug);
  return { ok: true, data: { slug } };
}

export async function deleteReview(reviewId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const review = await prisma.review.findFirst({
    where: { id: reviewId, userId },
    select: { slug: true, images: { select: { publicId: true } } },
  });
  if (!review) return { ok: false, error: "Review not found." };

  await Promise.allSettled(review.images.map((image) => deleteImage(image.publicId)));
  await prisma.review.delete({ where: { id: reviewId } });
  revalidateReviewPaths(review.slug);
  return { ok: true, data: null };
}

export async function toggleReviewLike(
  reviewId: string,
): Promise<ActionResult<{ liked: boolean; count: number }>> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const review = await prisma.review.findFirst({
    where: { id: reviewId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!review) return { ok: false, error: "Review not found." };

  const key = { userId_reviewId: { userId, reviewId } };
  const existing = await prisma.reviewLike.findUnique({ where: key });

  if (existing) {
    await prisma.reviewLike.delete({ where: key });
  } else {
    await prisma.reviewLike.create({ data: { userId, reviewId } });
  }

  const count = await prisma.reviewLike.count({ where: { reviewId } });
  return { ok: true, data: { liked: !existing, count } };
}

export async function addReviewComment(raw: unknown): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const parsed = commentInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid comment" };
  }
  const { reviewId, parentId, body } = parsed.data;

  const review = await prisma.review.findFirst({
    where: { id: reviewId, status: "PUBLISHED" },
    select: { slug: true },
  });
  if (!review) return { ok: false, error: "Review not found." };

  if (parentId) {
    // Only one level of replies
    const parent = await prisma.reviewComment.findFirst({
      where: { id: parentId, reviewId, parentId: null },
      select: { id: true },
    });
    if (!parent) return { ok: false, error: "Comment not found." };
  }

  await prisma.reviewComment.create({ data: { reviewId, userId, parentId, body } });
  revalidatePath(`/reviews/${review.slug}`);
  return { ok: true, data: null };
}

export async function deleteReviewComment(commentId: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: UNAUTHORIZED };

  const comment = await prisma.reviewComment.findUnique({
    where: { id: commentId },
    select: { userId: true, review: { select: { userId: true, slug: true } } },
  });
  if (!comment) return { ok: false, error: "Comment not found." };
  if (comment.userId !== userId && comment.review.userId !== userId) {
    return { ok: false, error: "Not allowed." };
  }

  await prisma.reviewComment.delete({ where: { id: commentId } });
  revalidatePath(`/reviews/${comment.review.slug}`);
  return { ok: true, data: null };
}
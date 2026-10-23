"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/services/db/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { deleteRatingSchema, upsertRatingSchema } from "./schema";
import type { ActionResult } from "./types";

function detailPath(mediaType: "MOVIE" | "TV", tmdbId: number) {
  return mediaType === "MOVIE" ? `/movies/${tmdbId}` : `/tv/${tmdbId}`;
}

export async function upsertRating(input: unknown): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Please sign in to rate." };

  const parsed = upsertRatingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const { tmdbId, mediaType, score, comment } = parsed.data;

  await prisma.mediaRating.upsert({
    where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } },
    create: { userId, tmdbId, mediaType, score, comment },
    update: { score, comment },
  });

  revalidatePath(detailPath(mediaType, tmdbId));
  return { ok: true };
}

export async function deleteRating(input: unknown): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Please sign in." };

  const parsed = deleteRatingSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const { tmdbId, mediaType } = parsed.data;

  await prisma.mediaRating.deleteMany({ where: { userId, tmdbId, mediaType } });

  revalidatePath(detailPath(mediaType, tmdbId));
  return { ok: true };
}
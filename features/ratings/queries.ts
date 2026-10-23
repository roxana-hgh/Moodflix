import "server-only";
import { prisma } from "@/services/db/prisma";
import type { Review } from "@/features/media/types";
import type { RatingStats, UserRating } from "./types";

type MediaType = "MOVIE" | "TV";

export async function getMediaRatingStats(tmdbId: number, mediaType: MediaType): Promise<RatingStats> {
  const agg = await prisma.mediaRating.aggregate({
    where: { tmdbId, mediaType },
    _avg: { score: true },
    _count: { _all: true },
  });

  return {
    average: agg._avg.score === null ? null : Math.round(agg._avg.score * 10) / 10,
    count: agg._count._all,
  };
}

export async function getUserRating(
  userId: string,
  tmdbId: number,
  mediaType: MediaType
): Promise<UserRating | null> {
  const row = await prisma.mediaRating.findUnique({
    where: { userId_tmdbId_mediaType: { userId, tmdbId, mediaType } },
    select: { score: true, comment: true },
  });
  return row;
}

// Only ratings that include a comment — mapped to the same `Review` shape
// TMDB reviews use, so one list/component renders both.
export async function getMoodflixReviews(
  tmdbId: number,
  mediaType: MediaType,
  limit = 30
): Promise<Review[]> {
  const rows = await prisma.mediaRating.findMany({
    where: { tmdbId, mediaType, comment: { not: null } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      score: true,
      comment: true,
      createdAt: true,
      user: { select: { name: true, avatarUrl: true, image: true } },
    },
  });

  return rows.map((r) => ({
    id: `moodflix-${r.id}`,
    source: "moodflix" as const,
    author: r.user.name,
    username: null,
    avatarUrl: r.user.avatarUrl ?? r.user.image ?? null,
    rating: r.score,
    content: r.comment ?? "",
    createdAtLabel: r.createdAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  }));
}
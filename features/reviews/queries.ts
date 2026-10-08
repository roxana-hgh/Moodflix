import "server-only";
import { cache } from "react";
import type { JSONContent } from "@tiptap/react";
import type { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/services/db/prisma";
import type { ReviewInput } from "./schema";
import type {
  ReviewCardItem,
  ReviewCommentItem,
  ReviewDetail,
} from "./types";

const authorSelect = {
  id: true,
  name: true,
  avatarUrl: true,
  image: true,
} satisfies Prisma.UserSelect;

const mediaSelect = {
  tmdbId: true,
  mediaType: true,
  title: true,
  posterPath: true,
  releaseYear: true,
} satisfies Prisma.ReviewMediaSelect;

const cardSelect = {
  id: true,
  slug: true,
  type: true,
  status: true,
  title: true,
  excerpt: true,
  coverUrl: true,
  hasSpoilers: true,
  overall: true,
  loved: true,
  disliked: true,
  publishedAt: true,
  user: { select: authorSelect },
  media: { orderBy: { position: "asc" }, take: 4, select: mediaSelect },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.ReviewSelect;

const detailSelect = {
  ...cardSelect,
  media: { orderBy: { position: "asc" }, select: mediaSelect },
  content: true,
  directing: true,
  acting: true,
  screenplay: true,
  visuals: true,
  music: true,
} satisfies Prisma.ReviewSelect;

type CardRow = Prisma.ReviewGetPayload<{ select: typeof cardSelect }>;
type DetailRow = Prisma.ReviewGetPayload<{ select: typeof detailSelect }>;

async function getLikedIds(viewerId: string | null, reviewIds: string[]): Promise<Set<string>> {
  if (!viewerId || reviewIds.length === 0) return new Set();
  const rows = await prisma.reviewLike.findMany({
    where: { userId: viewerId, reviewId: { in: reviewIds } },
    select: { reviewId: true },
  });
  return new Set(rows.map((row) => row.reviewId));
}

function toCardItem(row: CardRow, likedIds: Set<string>): ReviewCardItem {
  return {
    id: row.id,
    slug: row.slug,
    type: row.type,
    status: row.status,
    title: row.title,
    excerpt: row.excerpt,
    coverUrl: row.coverUrl,
    hasSpoilers: row.hasSpoilers,
    overall: row.overall,
    loved: row.loved,
    disliked: row.disliked,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    author: {
      id: row.user.id,
      name: row.user.name,
      avatarUrl: row.user.avatarUrl ?? row.user.image,
    },
    media: row.media,
    likeCount: row._count.likes,
    commentCount: row._count.comments,
    likedByViewer: likedIds.has(row.id),
  };
}

async function toCardItems(rows: CardRow[], viewerId: string | null): Promise<ReviewCardItem[]> {
  const likedIds = await getLikedIds(viewerId, rows.map((row) => row.id));
  return rows.map((row) => toCardItem(row, likedIds));
}

interface FeedParams {
  page: number;
  pageSize?: number;
  tmdbId?: number;
  mediaType?: "MOVIE" | "TV";
  viewerId: string | null;
}

export async function getReviewsFeed({
  page,
  pageSize = 12,
  tmdbId,
  mediaType,
  viewerId,
}: FeedParams) {
  const where = {
    status: "PUBLISHED",
    ...(tmdbId && mediaType ? { media: { some: { tmdbId, mediaType } } } : {}),
  } satisfies Prisma.ReviewWhereInput;

  const [rows, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    items: await toCardItems(rows, viewerId),
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getLatestReviews(take: number, viewerId: string | null): Promise<ReviewCardItem[]> {
  const rows = await prisma.review.findMany({
    where: { status: "PUBLISHED" },
    select: cardSelect,
    orderBy: { publishedAt: "desc" },
    take,
  });
  return toCardItems(rows, viewerId);
}

export async function getUserReviews(
  userId: string,
  options: { take: number; includeDrafts: boolean },
  viewerId: string | null,
): Promise<ReviewCardItem[]> {
  const rows = await prisma.review.findMany({
    where: { userId, ...(options.includeDrafts ? {} : { status: "PUBLISHED" }) },
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take: options.take,
  });
  return toCardItems(rows, viewerId);
}

export const getReviewBySlug = cache(
  async (slug: string, viewerId: string | null): Promise<ReviewDetail | null> => {
    const row: DetailRow | null = await prisma.review.findUnique({
      where: { slug },
      select: detailSelect,
    });
    if (!row) return null;
    if (row.status !== "PUBLISHED" && row.user.id !== viewerId) return null;

    const likedIds = await getLikedIds(viewerId, [row.id]);
    return {
      ...toCardItem(row, likedIds),
      content: row.content as JSONContent,
      ratings: {
        overall: row.overall,
        directing: row.directing,
        acting: row.acting,
        screenplay: row.screenplay,
        visuals: row.visuals,
        music: row.music,
      },
    };
  },
);

export async function getReviewForEdit(
  slug: string,
  userId: string,
): Promise<{ id: string; status: "DRAFT" | "PUBLISHED"; data: ReviewInput } | null> {
  const row = await prisma.review.findFirst({
    where: { slug, userId },
    select: detailSelect,
  });
  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    data: {
      type: row.type,
      title: row.title,
      content: row.content as ReviewInput["content"],
      hasSpoilers: row.hasSpoilers,
      loved: row.loved,
      disliked: row.disliked,
      media: row.media,
      overall: row.overall ?? undefined,
      directing: row.directing ?? undefined,
      acting: row.acting ?? undefined,
      screenplay: row.screenplay ?? undefined,
      visuals: row.visuals ?? undefined,
      music: row.music ?? undefined,
    },
  };
}

const commentSelect = {
  id: true,
  body: true,
  createdAt: true,
  user: { select: authorSelect },
} satisfies Prisma.ReviewCommentSelect;

type CommentRow = Prisma.ReviewCommentGetPayload<{ select: typeof commentSelect }>;

function toCommentItem(row: CommentRow, replies: ReviewCommentItem[]): ReviewCommentItem {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    author: {
      id: row.user.id,
      name: row.user.name,
      avatarUrl: row.user.avatarUrl ?? row.user.image,
    },
    replies,
  };
}

export async function getReviewComments(reviewId: string): Promise<ReviewCommentItem[]> {
  const rows = await prisma.reviewComment.findMany({
    where: { reviewId, parentId: null },
    select: {
      ...commentSelect,
      replies: { orderBy: { createdAt: "asc" }, select: commentSelect },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) =>
    toCommentItem(row, row.replies.map((reply) => toCommentItem(reply, []))),
  );
}
import "server-only";
import { prisma } from "@/services/db/prisma";
import {
  toListSummary,
  toListItemSummary,
  type ListSummary,
  type ListItemSummary,
  type ListMediaType,
  type ListType,
} from "./types";

export async function getUserLists(userId: string): Promise<ListSummary[]> {
  const lists = await prisma.list.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
  });
  return lists.map(toListSummary);
}

export async function getListItems(listId: string, userId: string): Promise<ListItemSummary[]> {
  const items = await prisma.listItem.findMany({
    where: { listId, list: { userId } },
    orderBy: { addedAt: "desc" },
  });
  return items.map(toListItemSummary);
}

/** Items in a user's default WATCHLIST or FAVORITE list — powers the profile carousels. */
export async function getUserListByType(
  userId: string,
  type: Extract<ListType, "WATCHLIST" | "FAVORITE">
): Promise<ListItemSummary[]> {
  const list = await prisma.list.findFirst({
    where: { userId, type },
    include: { items: { orderBy: { addedAt: "desc" } } },
  });
  if (!list) return [];
  return list.items.map(toListItemSummary);
}

/** Batched favorite-status lookup — one query for an arbitrary page of cards. */
export async function getFavoritedKeys(
  userId: string,
  items: { tmdbId: number; mediaType: ListMediaType }[]
): Promise<Set<string>> {
  if (items.length === 0) return new Set();

  const favoriteList = await prisma.list.findFirst({
    where: { userId, type: "FAVORITE" },
    select: { id: true },
  });
  if (!favoriteList) return new Set();

  const movieIds = items.filter((i) => i.mediaType === "MOVIE").map((i) => i.tmdbId);
  const tvIds = items.filter((i) => i.mediaType === "TV").map((i) => i.tmdbId);

  const matches = await prisma.listItem.findMany({
    where: {
      listId: favoriteList.id,
      OR: [
        ...(movieIds.length ? [{ mediaType: "MOVIE" as const, tmdbId: { in: movieIds } }] : []),
        ...(tvIds.length ? [{ mediaType: "TV" as const, tmdbId: { in: tvIds } }] : []),
      ],
    },
    select: { tmdbId: true, mediaType: true },
  });

  return new Set(matches.map((m) => toFavoritedKey(m.tmdbId, m.mediaType as ListMediaType)));
}

export function toFavoritedKey(tmdbId: number, mediaType: ListMediaType): string {
  return `${tmdbId}:${mediaType}`;
}

export async function getItemListIds(
  userId: string,
  tmdbId: number,
  mediaType: ListMediaType
): Promise<string[]> {
  const items = await prisma.listItem.findMany({
    where: { tmdbId, mediaType, list: { userId } },
    select: { listId: true },
  });
  return items.map((i) => i.listId);
}

/** Both toggle states in one query — powers the detail-page hero. */
export async function getItemListMembership(
  userId: string,
  tmdbId: number,
  mediaType: ListMediaType
): Promise<{ favorited: boolean; watchlisted: boolean }> {
  const items = await prisma.listItem.findMany({
    where: { tmdbId, mediaType, list: { userId, type: { in: ["FAVORITE", "WATCHLIST"] } } },
    select: { list: { select: { type: true } } },
  });
  const types = new Set(items.map((i) => i.list.type));
  return { favorited: types.has("FAVORITE"), watchlisted: types.has("WATCHLIST") };
}
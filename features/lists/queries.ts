import "server-only";
import { prisma } from "@/services/db/prisma";
import type { List, ListItem } from "@/lib/generated/prisma/client";
import {
  toListSummary,
  toListItemSummary,
  toListWithPreview,
  sortListsForDisplay,
  type ListSummary,
  type ListItemSummary,
  type ListWithPreview,
  type ListMediaType,
  type ListType,
  toListDetail,
  ListDetail,
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

/** Full list + items for the detail page. Returns null if not found or not visible to viewer. */
export async function getListWithItems(
  listId: string,
  viewerUserId: string | null
): Promise<{ list: List & { items: ListItem[] }; isOwner: boolean } | null> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { items: { orderBy: { addedAt: "desc" } } },
  });
  if (!list) return null;

  const isOwner = list.userId === viewerUserId;
  if (!list.isPublic && !isOwner) return null;

  return { list, isOwner };
}
export async function getUserListByType(
  userId: string,
  type: Extract<ListType, "WATCHLIST" | "FAVORITE" | "WATCHED">
): Promise<ListItemSummary[]> {
  const list = await prisma.list.findFirst({
    where: { userId, type },
    include: { items: { orderBy: { addedAt: "desc" } } },
  });
  if (!list) return [];
  return list.items.map(toListItemSummary);
}

async function getKeysByListType(
  userId: string,
  items: { tmdbId: number; mediaType: ListMediaType }[],
  type: Extract<ListType, "FAVORITE" | "WATCHED">
): Promise<Set<string>> {
  if (items.length === 0) return new Set();

  const list = await prisma.list.findFirst({
    where: { userId, type },
    select: { id: true },
  });
  if (!list) return new Set();

  const movieIds = items.filter((i) => i.mediaType === "MOVIE").map((i) => i.tmdbId);
  const tvIds = items.filter((i) => i.mediaType === "TV").map((i) => i.tmdbId);

  const matches = await prisma.listItem.findMany({
    where: {
      listId: list.id,
      OR: [
        ...(movieIds.length ? [{ mediaType: "MOVIE" as const, tmdbId: { in: movieIds } }] : []),
        ...(tvIds.length ? [{ mediaType: "TV" as const, tmdbId: { in: tvIds } }] : []),
      ],
    },
    select: { tmdbId: true, mediaType: true },
  });

  return new Set(matches.map((m) => toFavoritedKey(m.tmdbId, m.mediaType as ListMediaType)));
}

export async function getFavoritedKeys(
  userId: string,
  items: { tmdbId: number; mediaType: ListMediaType }[]
): Promise<Set<string>> {
  return getKeysByListType(userId, items, "FAVORITE");
}

export async function getWatchedKeys(
  userId: string,
  items: { tmdbId: number; mediaType: ListMediaType }[]
): Promise<Set<string>> {
  return getKeysByListType(userId, items, "WATCHED");
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

export async function getItemListMembership(
  userId: string,
  tmdbId: number,
  mediaType: ListMediaType
): Promise<{ favorited: boolean; watchlisted: boolean; watched: boolean }> {
  const items = await prisma.listItem.findMany({
    where: { tmdbId, mediaType, list: { userId, type: { in: ["FAVORITE", "WATCHLIST", "WATCHED"] } } },
    select: { list: { select: { type: true } } },
  });
  const types = new Set(items.map((i) => i.list.type));
  return {
    favorited: types.has("FAVORITE"),
    watchlisted: types.has("WATCHLIST"),
    watched: types.has("WATCHED"),
  };
}

export async function getUserListsWithPreview(userId: string, previewCount = 4): Promise<ListWithPreview[]> {
  const lists = await prisma.list.findMany({
    where: { userId },
    include: {
      _count: { select: { items: true } },
      items: { orderBy: { addedAt: "desc" }, take: previewCount, select: { posterPath: true } },
    },
  });

  return sortListsForDisplay(lists.map(toListWithPreview));
}

export async function getRecentListsWithPreview(
  userId: string,
  limit = 4,
  previewCount = 4
): Promise<ListWithPreview[]> {
  const lists = await prisma.list.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: { select: { items: true } },
      items: { orderBy: { addedAt: "desc" }, take: previewCount, select: { posterPath: true } },
    },
  });

  return lists.map(toListWithPreview);
}

export async function getUserListDetailByType(
  userId: string,
  type: Extract<ListType, "WATCHLIST" | "FAVORITE" | "WATCHED">
): Promise<ListDetail | null> {
  const list = await prisma.list.findFirst({
    where: { userId, type },
    include: { items: { orderBy: { addedAt: "desc" } } },
  });
  if (!list) return null;
  return toListDetail(list, true);
}
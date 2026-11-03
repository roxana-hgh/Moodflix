import "server-only";
import { prisma } from "@/services/db/prisma";
import type { List, ListItem } from "@/lib/generated/prisma/client";
import {
  toListSummary,
  toListItemSummary,
  toListWithPreview,
  sortListsForDisplay,
  toListDetail,
  toFavoritedKey,
  EMPTY_VIEWER_LIBRARY,
  type ListSummary,
  type ListItemSummary,
  type ListWithPreview,
  type ListMediaType,
  type ListType,
  type ListDetail,
  type GenreStat,
  type SystemListType,
  type ViewerLibrary,
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

/** Per-genre counts for one of the user's system lists (genre ids are per media type). */
export async function getGenreStats(
  userId: string,
  type: Extract<ListType, "FAVORITE" | "WATCHED">
): Promise<GenreStat[]> {
  const items = await prisma.listItem.findMany({
    where: { list: { userId, type } },
    select: { genreIds: true, mediaType: true },
  });

  const counts = new Map<string, GenreStat>();
  for (const { genreIds, mediaType } of items) {
    for (const genreId of genreIds) {
      const key = `${mediaType}:${genreId}`;
      const stat = counts.get(key) ?? { genreId, mediaType: mediaType as ListMediaType, count: 0 };
      stat.count += 1;
      counts.set(key, stat);
    }
  }
  return [...counts.values()];
}

/**
 * Every title in the viewer's three system lists, in one query. The client keeps
 * this as a set, so grids on any page can show saved state without their own query.
 */
export async function getViewerLibrary(userId: string): Promise<ViewerLibrary> {
  const items = await prisma.listItem.findMany({
    where: { list: { userId, type: { in: ["FAVORITE", "WATCHED", "WATCHLIST"] } } },
    select: { tmdbId: true, mediaType: true, list: { select: { type: true } } },
  });

  const library: ViewerLibrary = { FAVORITE: [], WATCHED: [], WATCHLIST: [] };
  for (const item of items) {
    library[item.list.type as SystemListType].push(toFavoritedKey(item.tmdbId, item.mediaType as ListMediaType));
  }
  return items.length ? library : EMPTY_VIEWER_LIBRARY;
}
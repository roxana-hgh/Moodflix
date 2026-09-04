import type { List, ListItem } from "@/lib/generated/prisma/client";

export type ListType = "WATCHLIST" | "FAVORITE" | "WATCHED" | "CUSTOM";
export type ListMediaType = "MOVIE" | "TV";

export interface ListSummary {
  id: string;
  type: ListType;
  name: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListItemSummary {
  id: string;
  tmdbId: number;
  mediaType: ListMediaType;
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  addedAt: Date;
}

export interface ListCardItem {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  mediaType: "movie" | "tv";
}

export interface ListDetail extends ListSummary {
  items: ListItemSummary[];
  isOwner: boolean;
}

// Powers the "all lists" grid — a few poster thumbnails instead of full item data.
export interface ListWithPreview extends ListSummary {
  previewPosters: (string | null)[];
}

type ListWithCount = List & { _count: { items: number } };
type ListWithItems = List & { items: ListItem[] };
type ListWithPreviewItems = List & { _count: { items: number }; items: { posterPath: string | null }[] };


const TYPE_PRIORITY: Record<ListType, number> = {
  WATCHLIST: 0,
  FAVORITE: 1,
  WATCHED: 2,
  CUSTOM: 3,
};

export function toListSummary(list: ListWithCount): ListSummary {
  return {
    id: list.id,
    type: list.type as ListType,
    name: list.name,
    isPublic: list.isPublic,
    itemCount: list._count.items,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
}

export function toListItemSummary(item: ListItem): ListItemSummary {
  return {
    id: item.id,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType as ListMediaType,
    title: item.title,
    posterPath: item.posterPath,
    releaseYear: item.releaseYear,
    addedAt: item.addedAt,
  };
}

export function toListCardItem(item: ListItemSummary): ListCardItem {
  return {
    id: item.tmdbId,
    title: item.title,
    posterPath: item.posterPath,
    releaseYear: item.releaseYear,
    mediaType: item.mediaType === "MOVIE" ? "movie" : "tv",
  };
}

export function toListDetail(list: ListWithItems, isOwner: boolean): ListDetail {
  return {
    id: list.id,
    type: list.type as ListType,
    name: list.name,
    isPublic: list.isPublic,
    itemCount: list.items.length,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    items: list.items.map(toListItemSummary),
    isOwner,
  };
}

export function toListWithPreview(list: ListWithPreviewItems): ListWithPreview {
  return {
    id: list.id,
    type: list.type as ListType,
    name: list.name,
    isPublic: list.isPublic,
    itemCount: list._count.items,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    previewPosters: list.items.map((i) => i.posterPath),
  };
}

export function sortListsForDisplay<T extends { type: ListType; createdAt: Date }>(lists: T[]): T[] {
  return [...lists].sort((a, b) => {
    const priorityDiff = TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
    if (priorityDiff !== 0) return priorityDiff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export function toListMediaType(mediaType: "movie" | "tv"): ListMediaType {
  return mediaType.toUpperCase() as ListMediaType;
}

export function toFavoritedKey(tmdbId: number, mediaType: ListMediaType): string {
  return `${mediaType}-${tmdbId}`;
}
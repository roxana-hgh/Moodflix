import type { List, ListItem } from "@/lib/generated/prisma/client";

export type ListType = "WATCHLIST" | "FAVORITE" | "CUSTOM";
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

type ListWithCount = List & { _count: { items: number } };

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

export function toListMediaType(mediaType: "movie" | "tv"): ListMediaType {
  return mediaType.toUpperCase() as ListMediaType;
}
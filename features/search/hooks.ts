"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/api/client";
import type { MediaCardItem } from "@/types/media";

const MIN_QUERY_LENGTH = 2;

export function useSearchMedia(query: string) {
  // Normalized the same way as the route, so "Dune " and "dune" share a cache entry.
  const normalized = query.trim().toLowerCase();

  return useQuery<MediaCardItem[]>({
    queryKey: ["search", "multi", normalized],
    queryFn: ({ signal }) =>
      getJson<MediaCardItem[]>("/api/tmdb/search", new URLSearchParams({ query: normalized }), signal),
    enabled: normalized.length >= MIN_QUERY_LENGTH,
    staleTime: 5 * 60_000, // re-typing a recent search won't refetch
    gcTime: 10 * 60_000,
    placeholderData: keepPreviousData, // avoids a flash of empty state between keystrokes
  });
}

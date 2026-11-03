"use client";

import { useCallback, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getJson } from "@/lib/api/client";
import { filtersToSearchParams, type MediaDiscoverFilters } from "./schema";
import type { CastMember } from "./types";
import type { TMDBPaginatedResponse } from "@/services/tmdb/types";
import type { MediaCardItem } from "@/types/media";

type DiscoverPage = TMDBPaginatedResponse<MediaCardItem>;

/**
 * Infinite discover grid. The server renders page 1 for the URL's filters and
 * passes it in as `initialPage`, so the first page never costs a client request.
 */
export function useDiscover(
  mediaType: "movie" | "tv",
  filters: MediaDiscoverFilters,
  initial: { filters: MediaDiscoverFilters; page: DiscoverPage },
) {
  // Canonical string: defaults are omitted, so equal filters give equal keys.
  const filtersKey = filtersToSearchParams(filters).toString();
  const isInitial = filtersKey === filtersToSearchParams(initial.filters).toString();

  return useInfiniteQuery({
    queryKey: ["discover", mediaType, filtersKey],
    queryFn: ({ pageParam, signal }) => {
      const params = new URLSearchParams(filtersKey);
      params.set("page", String(pageParam));
      return getJson<DiscoverPage>(`/api/tmdb/discover/${mediaType}`, params, signal);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined),
    initialData: isInitial ? { pages: [initial.page], pageParams: [1] } : undefined,
    staleTime: 5 * 60_000,
  });
}

/**
 * Filter state mirrored into the URL. Uses `history.replaceState`, which the Next
 * router picks up without a server round trip; `router.replace` would re-render
 * the page on the server for every filter change.
 */
export function useSyncedDiscoverFilters(initialFilters: MediaDiscoverFilters) {
  const [filters, setFiltersState] = useState(initialFilters);

  const setFilters = useCallback((next: MediaDiscoverFilters) => {
    setFiltersState(next);
    const query = filtersToSearchParams(next).toString();
    window.history.replaceState(null, "", query ? `${window.location.pathname}?${query}` : window.location.pathname);
  }, []);

  return [filters, setFilters] as const;
}

export function useMediaCast(mediaType: "movie" | "tv", tmdbId: number | null) {
  return useQuery({
    queryKey: ["media-cast", mediaType, tmdbId],
    queryFn: ({ signal }) => getJson<CastMember[]>(`/api/tmdb/${mediaType}/${tmdbId}/cast`, undefined, signal),
    enabled: tmdbId !== null,
    staleTime: 60 * 60_000,
  });
}

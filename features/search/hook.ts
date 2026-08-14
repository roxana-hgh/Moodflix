"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import { toMediaCardItem } from "@/features/media/types";
import type { TMDBMultiSearchResponse } from "@/services/tmdb/types";
import { MediaCardItem } from "@/types/media";

const MIN_QUERY_LENGTH = 2;

export function useSearchMedia(query: string) {
  const trimmed = query.trim();

  return useQuery<MediaCardItem[]>({
    queryKey: ["search", "multi", trimmed],
    queryFn: async ({ signal }) => {
      const { data } = await clientApi.get<TMDBMultiSearchResponse>(
        "/tmdb/search/multi",
        {
          params: { query: trimmed, include_adult: false },
          signal,
        },
      );

      return data.results
        .filter(
          (result) =>
            result.media_type === "movie" || result.media_type === "tv",
        )
        .map(toMediaCardItem);
    },
    enabled: trimmed.length >= MIN_QUERY_LENGTH,
    staleTime: 60_000, // re-typing something searched in the last minute won't refetch
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData, // avoids a flash of empty state between keystrokes
  });
}

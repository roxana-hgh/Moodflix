"use client";

import { buildDiscoverTVParams } from "@/features/media/schema";
import type { TVDiscoverFilters } from "@/features/media/schema";
import { toMediaCardItem } from "@/features/media/types";
import { clientApi } from "@/lib/api-client";
import type { TMDBPaginatedResponse, TMDBTVResult } from "@/services/tmdb/types";
import type { MediaCardItem } from "@/types/media";
import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";

type TVDiscoverQueryKey = readonly ["tv", "discover", TVDiscoverFilters];

export function useDiscoverTVShows(filters: TVDiscoverFilters) {
  return useInfiniteQuery<
    TMDBPaginatedResponse<MediaCardItem>,
    Error,
    InfiniteData<TMDBPaginatedResponse<MediaCardItem>>,
    TVDiscoverQueryKey,
    number
  >({
    queryKey: ["tv", "discover", filters],
    queryFn: async ({ pageParam }) => {
      const { data } = await clientApi.get<TMDBPaginatedResponse<TMDBTVResult>>(
        "/tmdb/discover/tv",
        { params: buildDiscoverTVParams(filters, pageParam) }
      );

      return {
        ...data,
        results: data.results.map((item) =>
          toMediaCardItem({ ...item, media_type: "tv" })
        ),
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
}
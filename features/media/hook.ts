"use client";

import { buildDiscoverMovieParams, buildDiscoverTVParams } from "@/features/media/schema";
import type { MediaDiscoverFilters, TVDiscoverFilters } from "@/features/media/schema";
import { toMediaCardItem } from "@/features/media/types";
import { clientApi } from "@/lib/api-client";
import type { TMDBMovieResult, TMDBPaginatedResponse, TMDBTVResult } from "@/services/tmdb/types";
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


export function useDiscoverMovies(filters: MediaDiscoverFilters) {
  return useInfiniteQuery({
    queryKey: ["movie", "discover", filters] as const,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const { data } = await clientApi.get<TMDBPaginatedResponse<TMDBMovieResult>>(
        "/tmdb/discover/movie",
        { params: buildDiscoverMovieParams(filters, pageParam) }
      );

      return {
        ...data,
        results: data.results.map((item) => toMediaCardItem({ ...item, media_type: "movie" })),
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
  });
}
"use client";

import { useEffect, useRef, useState } from "react";
import { MediaCardWithActions } from "@/components/media/media-card-with-actions";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { useFetchFavoritedKeys, useFetchWatchedKeys } from "@/features/lists/hooks";
import { toListMediaType } from "@/features/lists/types";
import type { InfiniteData } from "@tanstack/react-query";
import type { TMDBPaginatedResponse } from "@/services/tmdb/types";
import type { MediaCardItem } from "@/types/media";

interface MediaDiscoverGridProps {
  data: InfiniteData<TMDBPaginatedResponse<MediaCardItem>> | undefined;
  isLoading: boolean;
  isError: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}

export function MediaDiscoverGrid({
  data,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: MediaDiscoverGridProps) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = Boolean(session?.user);

  const [favoritedKeys, setFavoritedKeys] = useState<Set<string>>(new Set());
  const [watchedKeys, setWatchedKeys] = useState<Set<string>>(new Set());
  const fetchedPageCountRef = useRef(0);
  const { mutate: fetchFavoritedKeys } = useFetchFavoritedKeys();
  const { mutate: fetchWatchedKeys } = useFetchWatchedKeys();

  const pages = data?.pages ?? [];

  useEffect(() => {
    if (!isLoggedIn) return;

    // Filters changed → query reset → start over.
    if (pages.length < fetchedPageCountRef.current) {
      fetchedPageCountRef.current = 0;
      setFavoritedKeys(new Set());
      setWatchedKeys(new Set());
    }

    if (pages.length <= fetchedPageCountRef.current) return;

    const newItems = pages.slice(fetchedPageCountRef.current).flatMap((p) => p.results);
    fetchedPageCountRef.current = pages.length;
    if (newItems.length === 0) return;

    const refs = newItems.map((item) => ({ tmdbId: item.id, mediaType: toListMediaType(item.mediaType) }));

    fetchFavoritedKeys(refs, {
      onSuccess: (result) => {
        if (result.success) {
          setFavoritedKeys((prev) => new Set([...prev, ...result.data]));
        }
      },
    });

    fetchWatchedKeys(refs, {
      onSuccess: (result) => {
        if (result.success) {
          setWatchedKeys((prev) => new Set([...prev, ...result.data]));
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.length, isLoggedIn]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-muted-foreground py-10 text-sm text-center">Couldn&apos;t load results. Try again.</p>;
  }

  const items = pages.flatMap((page) => page.results);

  if (items.length === 0) {
    return <p className="text-muted-foreground py-10 text-sm text-center">Nothing matches these filters.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => {
          const key = `${item.id}:${toListMediaType(item.mediaType)}`;
          return (
            <MediaCardWithActions
              key={item.id}
              {...item}
              initialFavorited={favoritedKeys.has(key)}
              initialWatched={watchedKeys.has(key)}
            />
          );
        })}
      </div>

      {hasNextPage && (
        <Button variant="outline" className="mx-auto" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
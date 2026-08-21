"use client";

import { MediaCard } from "@/components/media/media-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

  const items = data?.pages.flatMap((page) => page.results) ?? [];

  if (items.length === 0) {
    return <p className="text-muted-foreground py-10 text-sm text-center">Nothing matches these filters.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => (
          <MediaCard key={item.id} {...item} />
        ))}
      </div>

      {hasNextPage && (
        <Button variant="outline" className="mx-auto" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
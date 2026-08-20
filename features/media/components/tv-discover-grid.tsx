"use client";


import { MediaCard } from "@/components/media/media-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDiscoverTVShows } from "@/features/media/hook";
import { TVDiscoverFilters } from "@/features/media/schema";


export function TVDiscoverGrid({ filters }: { filters: TVDiscoverFilters }) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useDiscoverTVShows(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="text-muted-foreground py-10 text-sm text-center">Couldn&apos;t load TV shows. Try again.</p>;
  }

  const shows = data?.pages.flatMap((page) => page.results) ?? [];

  if (shows.length === 0) {
    return <p className="text-muted-foreground py-10 text-sm text-center">No shows match these filters.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {shows.map((show) => (
          <MediaCard key={show.id} {...show} />
        ))}
      </div>

      {hasNextPage && (
        <Button
          variant="outline"
          className="mx-auto"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      )}
    </div>
  );
}
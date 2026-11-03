import { Suspense } from "react";
import { MediaGridSkeleton } from "@/components/media/media-grid-skeleton";
import { discoverMovies, discoverTVShows, getMovieGenres, getTVGenres } from "../queries";
import { filtersToSearchParams, searchParamsToFilters } from "../schema";
import { MediaDiscoverBrowser } from "./media-discover-browser";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface DiscoverPageProps {
  mediaType: "movie" | "tv";
  title: string;
  description: string;
  searchParams: SearchParams;
}

/** Shared body of /movies and /shows: a static header, then the filtered grid streamed in. */
export function DiscoverPage({ mediaType, title, description, searchParams }: DiscoverPageProps) {
  return (
    <div className="h-full py-5">
      <div className="container h-full mx-auto">
        <div className="flex flex-col h-full justify-end gap-2 min-h-10 lg:min-h-10">
          <h2 className="text-lg lg:text-2xl text-primary font-semibold">{title}</h2>
          <p className="text-sm md:text-base text-muted-foreground">{description}</p>
        </div>

        <Suspense fallback={<DiscoverSkeleton />}>
          <DiscoverResults mediaType={mediaType} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function DiscoverResults({ mediaType, searchParams }: { mediaType: "movie" | "tv"; searchParams: SearchParams }) {
  const filters = searchParamsToFilters(await searchParams);
  // Both cached: genres for a week, each filter combination's first page for an hour.
  const [genres, initialPage] = await Promise.all([
    mediaType === "movie" ? getMovieGenres() : getTVGenres(),
    mediaType === "movie" ? discoverMovies(filters, 1) : discoverTVShows(filters, 1),
  ]);

  return (
    <MediaDiscoverBrowser
      // A new URL from outside (e.g. a genre badge) must reset preserved client state.
      key={filtersToSearchParams(filters).toString()}
      mediaType={mediaType}
      genres={genres}
      initialFilters={filters}
      initialPage={initialPage}
    />
  );
}

function DiscoverSkeleton() {
  return (
    <div className="py-3 flex flex-col gap-4">
      <div className="h-9 w-full max-w-xl rounded-md bg-muted animate-pulse" />
      <MediaGridSkeleton />
    </div>
  );
}

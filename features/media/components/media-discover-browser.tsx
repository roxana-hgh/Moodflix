"use client";

import type { TMDBGenre } from "@/services/tmdb/types";
import { useDiscover, useSyncedDiscoverFilters } from "../hooks";
import type { DiscoverPage } from "../queries";
import type { MediaDiscoverFilters } from "../schema";
import { MediaDiscoverFiltersBar } from "./media-discover-filters";
import { MediaDiscoverGrid } from "./media-discover-grid";

interface MediaDiscoverBrowserProps {
  mediaType: "movie" | "tv";
  genres: TMDBGenre[];
  initialFilters: MediaDiscoverFilters;
  /** Page 1 for `initialFilters`, rendered on the server. */
  initialPage: DiscoverPage;
}

export function MediaDiscoverBrowser({ mediaType, genres, initialFilters, initialPage }: MediaDiscoverBrowserProps) {
  const [filters, setFilters] = useSyncedDiscoverFilters(initialFilters);
  const query = useDiscover(mediaType, filters, { filters: initialFilters, page: initialPage });

  return (
    <div className="py-3 flex flex-col gap-4">
      <MediaDiscoverFiltersBar mediaType={mediaType} filters={filters} genres={genres} onChange={setFilters} />
      <MediaDiscoverGrid {...query} />
    </div>
  );
}

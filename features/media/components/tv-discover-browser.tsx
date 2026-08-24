"use client";

import { MediaDiscoverFiltersBar } from "./media-discover-filters";
import { MediaDiscoverGrid } from "./media-discover-grid";

import type { MediaDiscoverFilters } from "../schema";
import { useDiscoverTVShows, useSyncedDiscoverFilters } from "@/features/media/hook";

interface TVGenre {
  id: number;
  name: string;
}

interface TVDiscoverBrowserProps {
  genres: TVGenre[];
  initialFilters: MediaDiscoverFilters;
}

export function TVDiscoverBrowser({ genres, initialFilters }: TVDiscoverBrowserProps) {
  const [filters, setFilters] = useSyncedDiscoverFilters(initialFilters);
  const query = useDiscoverTVShows(filters);

  return (
    <div className="py-3 flex flex-col gap-4">
      <MediaDiscoverFiltersBar mediaType="tv" filters={filters} genres={genres} onChange={setFilters} />
      <MediaDiscoverGrid {...query} />
    </div>
  );
}
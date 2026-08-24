"use client";

import { MediaDiscoverFiltersBar } from "./media-discover-filters";
import { MediaDiscoverGrid } from "./media-discover-grid";
import type { MediaDiscoverFilters } from "../schema";
import { useDiscoverMovies, useSyncedDiscoverFilters } from "@/features/media/hook";

interface MovieGenre {
  id: number;
  name: string;
}

interface MovieDiscoverBrowserProps {
  genres: MovieGenre[];
  initialFilters: MediaDiscoverFilters;
}

export function MovieDiscoverBrowser({ genres, initialFilters }: MovieDiscoverBrowserProps) {
  const [filters, setFilters] = useSyncedDiscoverFilters(initialFilters);
  const query = useDiscoverMovies(filters);

  return (
    <div className="py-3 flex flex-col gap-4">
      <MediaDiscoverFiltersBar mediaType="movie" filters={filters} genres={genres} onChange={setFilters} />
      <MediaDiscoverGrid {...query} />
    </div>
  );
}
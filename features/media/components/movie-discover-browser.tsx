"use client";

import { useState } from "react";
import { MediaDiscoverFiltersBar } from "./media-discover-filters";
import { MediaDiscoverGrid } from "./media-discover-grid";

import { defaultMediaDiscoverFilters } from "../schema";
import { useDiscoverMovies } from "@/features/media/hook";

interface MovieGenre {
  id: number;
  name: string;
}

export function MovieDiscoverBrowser({ genres }: { genres: MovieGenre[] }) {
  const [filters, setFilters] = useState(defaultMediaDiscoverFilters);
  const query = useDiscoverMovies(filters);

  return (
    <div className="py-3 flex flex-col gap-4">
      <MediaDiscoverFiltersBar mediaType="movie" filters={filters} genres={genres} onChange={setFilters} />
      <MediaDiscoverGrid {...query} />
    </div>
  );
}
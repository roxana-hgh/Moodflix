"use client";

import { useState } from "react";
import { TVDiscoverFiltersBar } from "./tv-discover-filters";
import { TVDiscoverGrid } from "./tv-discover-grid";
import { defaultTVDiscoverFilters } from "../schema";

interface TVGenre {
  id: number;
  name: string;
}

export function TVDiscoverBrowser({ genres }: { genres: TVGenre[] }) {
  const [filters, setFilters] = useState(defaultTVDiscoverFilters);

  return (
    <div className="py-3 flex flex-col gap-4">
      <TVDiscoverFiltersBar filters={filters} genres={genres} onChange={setFilters} />
      <TVDiscoverGrid filters={filters} />
    </div>
  );
}
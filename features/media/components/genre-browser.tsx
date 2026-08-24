"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { MediaKind } from "../schema";

interface Genre {
  id: number;
  name: string;
}

interface GenreBrowserProps {
  movieGenres: Genre[];
  tvGenres: Genre[];
}

export function GenreBrowser({ movieGenres, tvGenres }: GenreBrowserProps) {
  const [mediaType, setMediaType] = useState<MediaKind>("movie");
  const genres = mediaType === "movie" ? movieGenres : tvGenres;
  const basePath = mediaType === "movie" ? "/movies" : "/shows";

  return (
    <div className="py-3 flex flex-col gap-5">
      <div className="inline-flex w-fit rounded-full border border-border p-0.5">
        {(["movie", "tv"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setMediaType(type)}
            className={cn(
              "rounded-full px-4 py-1 text-sm font-medium transition-colors",
              mediaType === type
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {type === "movie" ? "Movies" : "TV Shows"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {genres.map((genre) => (
          <Link
            key={genre.id}
            href={`${basePath}?genre=${genre.id}`}
            className="flex items-center text-sm lg:text-base justify-center rounded-xl border border-border bg-card px-4 py-6 xl:py-8 text-center font-semibold text-card-foreground transition-colors hover:border-primary hover:bg-accent"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
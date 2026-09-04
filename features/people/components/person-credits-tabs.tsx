"use client";

import { useMemo, useState } from "react";

import type { PersonCreditItem } from "../types";
import type { CreditStatusMaps } from "../queries";

import { cn } from "@/lib/utils";
import { MediaCardWithActions } from "@/components/media/media-card-with-actions";
import { toFavoritedKey, toListMediaType } from "@/features/lists/types";

type SortOption = "newest" | "oldest" | "rating" | "popularity";

function sortCredits(items: PersonCreditItem[], sort: SortOption) {
  const copy = [...items];
  switch (sort) {
    case "oldest":
      return copy.sort((a, b) => (a.releaseYear ?? "9999").localeCompare(b.releaseYear ?? "9999"));
    case "rating":
      return copy.sort((a, b) => b.voteAverage - a.voteAverage);
    case "popularity":
      return copy.sort((a, b) => b.popularity - a.popularity);
    case "newest":
    default:
      return copy.sort((a, b) => (b.releaseYear ?? "0").localeCompare(a.releaseYear ?? "0"));
  }
}

interface PersonCreditsTabsProps {
  movieCredits: PersonCreditItem[];
  tvCredits: PersonCreditItem[];
  status: CreditStatusMaps;
}

export function PersonCreditsTabs({ movieCredits, tvCredits, status }: PersonCreditsTabsProps) {
  const [mediaType, setMediaType] = useState<"movie" | "tv">(
    movieCredits.length > 0 ? "movie" : "tv"
  );
  const [sort, setSort] = useState<SortOption>("newest");

  const activeCredits = mediaType === "movie" ? movieCredits : tvCredits;
  const sorted = useMemo(() => sortCredits(activeCredits, sort), [activeCredits, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex w-fit rounded-full border border-border p-0.5">
          {(["movie", "tv"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMediaType(type)}
              disabled={
                (type === "movie" && movieCredits.length === 0) ||
                (type === "tv" && tvCredits.length === 0)
              }
              className={cn(
                "rounded-full px-4 py-1 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40",
                mediaType === type
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {type === "movie" ? `Movies (${movieCredits.length})` : `TV Shows (${tvCredits.length})`}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="rating">Highest rated</option>
          <option value="popularity">Most popular</option>
        </select>
      </div>

      <div className="mt-6">
        {sorted.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No {mediaType === "movie" ? "movie" : "TV"} credits found.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {sorted.map((credit) => {
              const key = toFavoritedKey(credit.id, toListMediaType(credit.mediaType));
              return (
                <MediaCardWithActions
                  key={key}
                  id={credit.id}
                  mediaType={credit.mediaType}
                  title={credit.title}
                  overview={credit.overview}
                  posterPath={credit.posterPath}
                  releaseYear={credit.releaseYear}
                  voteAverage={credit.voteAverage}
                  initialFavorited={status.favoritedKeys.has(key)}
                  initialWatched={status.watchedKeys.has(key)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
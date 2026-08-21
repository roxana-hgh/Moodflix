"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { SeasonSummary } from "../types";
import { tmdbImageUrl } from "@/utils/image";
import Link from "next/link";


const PREVIEW_COUNT = 6;

export function SeasonsList({ tvId, seasons }: { tvId: number; seasons: SeasonSummary[] }) {
  const [expanded, setExpanded] = useState(false);
  if (seasons.length === 0) return null;

  const visible = expanded ? seasons : seasons.slice(0, PREVIEW_COUNT);
  const hasMore = seasons.length > PREVIEW_COUNT;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-5 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold text-primary">
        Seasons ({seasons.length})
      </h2>

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {visible.map((season) => (
          <Link
            href={`/tv/${tvId}/season/${season.seasonNumber}`}
            key={season.id}
            className=""
          >
            <div className="flex flex-col gap-2">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                {season.posterPath && (
                  <Image
                    src={tmdbImageUrl(season.posterPath, "w342")}
                    alt={season.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="text-xs px-1">
                <p className="truncate font-medium text-foreground">{season.name}</p>
                <p className="text-muted-foreground">{season.episodeCount} episodes</p>
              </div>
            </div>
          </Link>

        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          {expanded ? "Show less" : `Show all ${seasons.length} seasons`}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
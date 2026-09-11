"use client";

import { useMemo, useState } from "react";
import { MediaTypeToggle, type MediaTypeFilter } from "./media-type-toggle";

import type { MediaCardItem } from "@/types/media";
import { MediaCardWithActions } from "@/components/media/media-card-with-actions";

interface MoodResultsGridProps {
  results: MediaCardItem[];
  usedFallback: boolean;
}

export function MoodResultsGrid({ results, usedFallback }: MoodResultsGridProps) {
  const [activeTab, setActiveTab] = useState<MediaTypeFilter>("all");

  const counts = useMemo(
    () => ({
      all: results.length,
      movie: results.filter((r) => r.mediaType === "movie").length,
      tv: results.filter((r) => r.mediaType === "tv").length,
    }),
    [results]
  );

  const visible = useMemo(
    () => (activeTab === "all" ? results : results.filter((r) => r.mediaType === activeTab)),
    [results, activeTab]
  );

  if (results.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-heading text-base font-semibold text-foreground mb-2">Nothing matched that mood.</p>
        <p className="text-muted-foreground">
          Try naming a genre or setting directly — &quot;slow-burn detective story&quot; works better than &quot;idk something good.&quot;
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <MediaTypeToggle value={activeTab} onChange={setActiveTab} counts={counts} />
        {usedFallback && (
          <p className="text-xs text-muted-foreground">Showing broader results for that search</p>
        )}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          No {activeTab === "movie" ? "movies" : "shows"} matched — try &quot;All&quot; instead.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {visible.map((item) => (
            <MediaCardWithActions key={`${item.mediaType}-${item.id}`} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
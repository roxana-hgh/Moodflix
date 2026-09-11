"use client";

import { useState, useTransition } from "react";
import { getMoodRecommendations } from "../actions";
import { MoodSearchBar } from "./mood-search-bar";
import { InterpretedMood } from "./interpreted-mood";
import { MoodLoadingState } from "./mood-loading-state";
import { MoodResultsGrid } from "./mood-results-grid";
import type { MediaCardItem } from "@/types/media";

export function MoodDiscoverPage() {
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<MediaCardItem[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [interpreted, setInterpreted] = useState<{ genres: string[]; keywordTerms: string[] } | null>(null);

  const handleSearch = (mood: string) => {
    setHasSearched(true);
    startTransition(async () => {
      const data = await getMoodRecommendations({ mood });
      setResults(data.results);
      setUsedFallback(data.usedFallback);
      setInterpreted(data.interpreted);
    });
  };

  return (
    <div className="min-h-screen  px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <MoodSearchBar onSubmit={handleSearch} isPending={isPending} />

        {interpreted && !isPending && (
          <div className="mt-5">
            <InterpretedMood genres={interpreted.genres} keywordTerms={interpreted.keywordTerms} />
          </div>
        )}

        {hasSearched && (
          <div className="mt-10">
            {isPending ? (
              <MoodLoadingState />
            ) : (
              <MoodResultsGrid results={results} usedFallback={usedFallback} />
            )}
          </div>
        )}
      </div>
    </div>

  );
}
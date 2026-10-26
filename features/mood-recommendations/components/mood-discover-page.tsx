"use client";

import { useState, useTransition } from "react";
import { getMoodRecommendations } from "../actions";
import type { MoodSearchRequest } from "../schema";
import { MoodSearchBar } from "./mood-search-bar";
import { InterpretedMood } from "./interpreted-mood";

import { MoodLoadingState } from "./mood-loading-state";
import { MoodResultsGrid } from "./mood-results-grid";
import type { MediaCardItem } from "@/types/media";
import { TasteIndicator } from "@/features/mood-recommendations/components/TasteIndicator";

export function MoodDiscoverPage() {
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<MediaCardItem[]>([]);
  const [usedFallback, setUsedFallback] = useState(false);
  const [interpreted, setInterpreted] = useState<{ genres: string[]; keywordTerms: string[] } | null>(null);
  const [taste, setTaste] = useState<{ genres: string[] } | null>(null);
  const [personalize, setPersonalize] = useState(true);
  const [lastRequest, setLastRequest] = useState<MoodSearchRequest | null>(null);

  const run = (request: MoodSearchRequest, withTaste: boolean) => {
    setHasSearched(true);
    setLastRequest(request);
    startTransition(async () => {
      const data = await getMoodRecommendations({ ...request, personalize: withTaste });
      setResults(data.results);
      setUsedFallback(data.usedFallback);
      setInterpreted(data.interpreted);
      setTaste(data.taste);
    });
  };

  const handleSearch = (request: MoodSearchRequest) => run(request, personalize);

  const handleTasteToggle = (next: boolean) => {
    setPersonalize(next);
    if (lastRequest) run(lastRequest, next);
  };

  return (
    <div className="min-h-screen  px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
      <div className="max-w-5xl mx-auto">
        <MoodSearchBar onSubmit={handleSearch} isPending={isPending} />

        {!isPending && (interpreted || taste) && (
          <div className="mt-5 space-y-3">
            {interpreted && (
              <InterpretedMood genres={interpreted.genres} keywordTerms={interpreted.keywordTerms} />
            )}
            {taste && (
              <TasteIndicator
                genres={taste.genres}
                active={personalize}
                disabled={isPending}
                onToggle={handleTasteToggle}
              />
            )}
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
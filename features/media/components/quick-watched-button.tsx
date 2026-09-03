"use client";

import { QuickListButton } from "@/features/lists/components/quick-list-button";
import { CheckCircle } from "lucide-react";


interface QuickWatchedButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  initialWatched: boolean;
}

export function QuickWatchedButton(props: QuickWatchedButtonProps) {
  return (
    <QuickListButton
      listType="WATCHED"
      tmdbId={props.tmdbId}
      mediaType={props.mediaType}
      title={props.title}
      posterPath={props.posterPath}
      releaseYear={props.releaseYear}
      initialActive={props.initialWatched}
      label="Mark as watched"
      activeLabel="Remove from watched"
      className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
      icon={<CheckCircle className="h-3.5 w-3.5" />}
      activeIcon={<CheckCircle className="h-3.5 w-3.5 stroke-primary text-primary" />}
    />
  );
}
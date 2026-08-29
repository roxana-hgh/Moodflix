"use client";

import { Heart } from "lucide-react";
import { QuickListButton } from "./quick-list-button";

interface QuickFavoriteButtonProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  initialFavorited: boolean;
}

export function QuickFavoriteButton(props: QuickFavoriteButtonProps) {
  return (
    <QuickListButton
      listType="FAVORITE"
      tmdbId={props.tmdbId}
      mediaType={props.mediaType}
      title={props.title}
      posterPath={props.posterPath}
      releaseYear={props.releaseYear}
      initialActive={props.initialFavorited}
      label="Add to favorites"
      activeLabel="Remove from favorites"
      className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
      icon={<Heart className="h-3.5 w-3.5" />}
      activeIcon={<Heart className="h-3.5 w-3.5 fill-primary text-primary" />}
    />
  );
}
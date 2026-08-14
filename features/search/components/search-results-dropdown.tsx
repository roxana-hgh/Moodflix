"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, SearchX } from "lucide-react";
import { tmdbImageUrl } from "@/utils/image";
import { MediaCardItem } from "@/types/media";


interface SearchResultsDropdownProps {
  query: string;
  results: MediaCardItem[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  onSelect?: () => void;
}

export function SearchResultsDropdown({
  query,
  results,
  isLoading,
  isFetching,
  onSelect,
}: SearchResultsDropdownProps) {
  const trimmed = query.trim();
  if (trimmed.length < 2) return null;

  return (
    <div className="w-full rounded-2xl border bg-card p-2 shadow-sm">
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Searching…
        </div>
      ) : results && results.length > 0 ? (
        <ul className="m-0 max-h-96 list-none divide-y divide-border/60 overflow-y-auto p-0">
          {results.map((item) => (
            <li key={`${item.mediaType}-${item.id}`}>
              <Link
                href={`/${item.mediaType === "tv" ? "tv" : "movies"}/${item.id}`}
                onClick={onSelect}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary"
              >
                <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {item.posterPath && (
                    <Image
                      src={tmdbImageUrl(item.posterPath)}
                      alt={item.title}
                      width={40}
                      height={60}
                      className="object-cover block w-full h-full"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.mediaType === "tv" ? "TV Show" : "Movie"}
                    {item.releaseYear ? ` • ${item.releaseYear}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          ))}
          {isFetching && (
            <li className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> Updating…
            </li>
          )}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-1 py-6 text-center">
          <SearchX className="size-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No results for &apos;{trimmed}&lsquo;</p>
        </div>
      )}
    </div>
  );
}
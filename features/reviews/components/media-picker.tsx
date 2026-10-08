"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { toListMediaType } from "@/features/lists/types";
import { useDebounce } from "@/hooks/use-debounce";

import type { MediaCardItem } from "@/types/media";
import type { ReviewMediaItem } from "../types";
import { tmdbImageUrl } from "@/utils/image";
import { useSearchMedia } from "@/features/search/hook";

interface PosterThumbProps {
  posterPath: string | null;
  title: string;
}

function PosterThumb({ posterPath, title }: PosterThumbProps) {
  return (
    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
      {posterPath && (
        <Image src={tmdbImageUrl(posterPath)} alt={title} fill sizes="40px" className="object-cover" />
      )}
    </div>
  );
}

interface MediaPickerProps {
  mode: "single" | "multiple";
  value: ReviewMediaItem[];
  onChange: (value: ReviewMediaItem[]) => void;
  max?: number;
}

export function MediaPicker({ mode, value, onChange, max = 50 }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { data: results = [], isFetching } = useSearchMedia(debouncedQuery);

  const isSelected = (item: MediaCardItem) =>
    value.some((v) => v.tmdbId === item.id && v.mediaType === toListMediaType(item.mediaType));

  function handleSelect(item: MediaCardItem) {
    const mediaType = toListMediaType(item.mediaType);

    if (isSelected(item)) {
      onChange(value.filter((v) => !(v.tmdbId === item.id && v.mediaType === mediaType)));
      return;
    }

    const next: ReviewMediaItem = {
      tmdbId: item.id,
      mediaType,
      title: item.title,
      posterPath: item.posterPath ?? null,
      releaseYear: item.releaseYear ?? null,
    };

    if (mode === "single") {
      onChange([next]);
      setOpen(false);
    } else if (value.length < max) {
      onChange([...value, next]);
    }
  }

  const hasQuery = debouncedQuery.trim().length >= 2;

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-start gap-2 text-muted-foreground">
            <Search className="size-4" />
            {mode === "single"
              ? value.length > 0 ? "Change title" : "Search for a movie or TV show"
              : "Add movies or TV shows"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput value={query} onValueChange={setQuery} placeholder="Type at least 2 characters..." />
            <CommandList className="max-h-[320px]">
              {!hasQuery && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">Start typing to search</p>
              )}
              {hasQuery && !isFetching && results.length === 0 && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              {hasQuery &&
                results.map((item) => (
                  <CommandItem
                    key={`${item.mediaType}-${item.id}`}
                    value={`${item.mediaType}-${item.id}`}
                    onSelect={() => handleSelect(item)}
                    className="gap-3"
                  >
                    <PosterThumb posterPath={item.posterPath ?? null} title={item.title} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.releaseYear ?? "—"}</p>
                    </div>
                    {isSelected(item) && <Badge variant="secondary">Selected</Badge>}
                  </CommandItem>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((item) => (
            <li key={`${item.mediaType}-${item.tmdbId}`} className="flex items-center gap-3 rounded-lg border bg-background/40 p-2">
              <PosterThumb posterPath={item.posterPath} title={item.title} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.releaseYear ?? "—"} · {item.mediaType === "MOVIE" ? "Movie" : "TV Show"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                aria-label={`Remove ${item.title}`}
                onClick={() => onChange(value.filter((v) => v !== item))}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
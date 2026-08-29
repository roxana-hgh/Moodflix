"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Plus, Check, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { tmdbImageUrl } from "@/utils/image";
import { useDebounce } from "@/hooks/use-debounce";

import { useAddItemToList, useRemoveItemFromList } from "../hooks";
import { toListMediaType, type ListItemSummary } from "../types";
import type { MediaCardItem } from "@/types/media";
import { useSearchMedia } from "@/features/search/hook";

interface AddRemoveMediaDialogProps {
  listId: string;
  currentItems: ListItemSummary[];
}

export function AddRemoveMediaDialog({ listId, currentItems }: AddRemoveMediaDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);

  const { data: results, isLoading, isFetching } = useSearchMedia(debouncedQuery);

  const initialMemberKeys = useMemo(
    () => new Set(currentItems.map((item) => `${item.tmdbId}:${item.mediaType}`)),
    [currentItems]
  );
  const [memberKeys, setMemberKeys] = useState(initialMemberKeys);

  const addItem = useAddItemToList();
  const removeItem = useRemoveItemFromList();

  function handleToggle(item: MediaCardItem) {
    const listMediaType = toListMediaType(item.mediaType);
    const key = `${item.id}:${listMediaType}`;
    const isMember = memberKeys.has(key);

    setMemberKeys((prev) => {
      const next = new Set(prev);
      if (isMember) next.delete(key);
      else next.add(key);
      return next;
    });

    if (isMember) {
      removeItem.mutate({ listId, tmdbId: item.id, mediaType: listMediaType });
    } else {
      addItem.mutate({
        listId,
        tmdbId: item.id,
        mediaType: listMediaType,
        title: item.title,
        posterPath: item.posterPath,
        releaseYear: item.releaseYear,
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2 rounded-full">
          <ListPlus className="h-4 w-4" /> Add / Remove
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-base text-start">
          <DialogTitle>Search & manage items</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            placeholder="Search movies & TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex max-h-96 flex-col gap-1 overflow-y-auto">
          {query.trim().length < 2 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Start typing to search.</p>
          ) : isLoading || isFetching ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Searching…</p>
          ) : results?.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No results found.</p>
          ) : (
            results?.map((item) => {
              const key = `${item.id}:${toListMediaType(item.mediaType)}`;
              const isMember = memberKeys.has(key);
              return (
                <div key={key} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
                  <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                    {item.posterPath && (
                      <Image src={tmdbImageUrl(item.posterPath)} alt={item.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.releaseYear || "TBA"} · {item.mediaType === "movie" ? "Movie" : "TV"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant={isMember ? "default" : "outline"}
                    className="h-8 w-8 shrink-0 rounded-full"
                    onClick={() => handleToggle(item)}
                  >
                    {isMember ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
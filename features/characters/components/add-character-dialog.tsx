"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ChevronRight, Clapperboard, Loader2, Plus, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { tmdbImageUrl } from "@/utils/image";

import { FavoriteCharacterButton } from "./favorite-character-button";
import { toCharacterKey } from "../keys";
import { useSearchMedia } from "@/features/search/hook";
import { useMediaCast } from "@/features/media/hook";

type Selected = { tmdbId: number; mediaType: "movie" | "tv"; title: string };

function EmptyHint({ icon: Icon, text }: { icon: typeof Search; text: string }) {
  return (
    <div className="flex h-full min-h-[30dvh] flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
      <Icon className="size-8 opacity-50" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex min-h-[30dvh] items-center justify-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

// Mounted only while the dialog is open → closing the dialog resets ALL state below.
function AddCharacterContent({ favoriteKeys }: { favoriteKeys: string[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [selected, setSelected] = useState<Selected | null>(null);
  const [keys, setKeys] = useState(() => new Set(favoriteKeys));

  const search = useSearchMedia(query);
  const cast = useMediaCast(selected?.mediaType ?? "movie", selected?.tmdbId ?? null);

  function updateKey(key: string, isFavorite: boolean) {
    setKeys((prev) => {
      const next = new Set(prev);
      if (isFavorite) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function goBack() {
    setSelected(null);
    setFilter("");
  }

  const filterLower = filter.trim().toLowerCase();
  const characters =
    cast.data
      ?.filter((m) => m.character)
      .filter(
        (m) =>
          !filterLower ||
          m.character.toLowerCase().includes(filterLower) ||
          m.name.toLowerCase().includes(filterLower),
      ) ?? [];

  return (
    <>
      <DialogHeader className="space-y-3 border-b px-4 pb-4 pr-12 pt-4 text-left sm:px-6 sm:pt-6">
        <div className="flex items-center gap-2">
          {selected && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-ml-2 size-8 shrink-0"
              onClick={goBack}
              aria-label="Back to search"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="min-w-0">
            <DialogTitle className="truncate text-base mb-1!">
              {selected ? selected.title : "Add favorite characters"}
            </DialogTitle>
            <DialogDescription className="text-xs ">
              {selected ? "Tap the heart to add a character." : "Find a movie or TV show first."}
            </DialogDescription>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          {selected ? (
            <Input
              key="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter characters..."
              className="pl-9"
            />
          ) : (
            <Input
              key="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies & TV shows..."
              className="pl-9"
              autoFocus
            />
          )}
        </div>
      </DialogHeader>

      <div className="h-[55dvh] overflow-y-auto px-2 py-2 sm:px-4">
        {!selected ? (
          query.trim().length < 2 ? (
            <EmptyHint icon={Clapperboard} text="Type at least 2 letters to search." />
          ) : search.isLoading ? (
            <Loading />
          ) : !search.data?.length ? (
            <EmptyHint icon={Search} text="No results found." />
          ) : (
            <ul className="space-y-1">
              {search.data.map((item) => (
                <li key={`${item.mediaType}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected({ tmdbId: item.id, mediaType: item.mediaType, title: item.title })
                    }
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {item.posterPath && (
                        <Image
                          src={tmdbImageUrl(item.posterPath)}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.mediaType === "movie" ? "Movie" : "TV"}
                        {item.releaseYear ? ` · ${item.releaseYear}` : ""}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )
        ) : cast.isLoading ? (
          <Loading />
        ) : characters.length === 0 ? (
          <EmptyHint icon={UserRound} text="No characters found." />
        ) : (
          <ul className="grid gap-1 sm:grid-cols-2">
            {characters.map((m, i) => {
              const key = toCharacterKey(selected.mediaType, selected.tmdbId, m.character);
              return (
                <li
                  key={`${m.id}-${i}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-accent/50"
                >
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-muted">
                    {m.profilePath ? (
                      <Image
                        src={tmdbImageUrl(m.profilePath)}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : (
                      <UserRound className="absolute inset-0 m-auto size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.character}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.name}</p>
                  </div>
                  <FavoriteCharacterButton
                    variant="inline"
                    initialFavorite={keys.has(key)}
                    onToggled={(fav) => updateKey(key, fav)}
                    character={{
                      characterName: m.character,
                      actorId: m.id,
                      actorName: m.name,
                      profilePath: m.profilePath,
                      mediaTmdbId: selected.tmdbId,
                      mediaType: selected.mediaType,
                      mediaTitle: selected.title,
                    }}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}

export function AddCharacterDialog({ favoriteKeys }: { favoriteKeys: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className=" flex justify-center text-sm items-center aspect-[2/3] overflow-hidden rounded-xl border border-dashed border-border/75 hover:border-border hover:bg-muted/10 hover:text-primary cursor-pointer ">
          <Plus className="size-3.5" /> Add
        </div>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90dvh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <AddCharacterContent favoriteKeys={favoriteKeys} />
      </DialogContent>
    </Dialog>
  );
}
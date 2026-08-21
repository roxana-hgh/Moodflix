"use client";

import { useState } from "react";
import { SlidersHorizontal, TrendingUp, Star, CalendarClock, ArrowDownAZ, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useMediaQuery } from "@/hooks/use-media-query";
import { discoverSortOptions, popularWatchProviders } from "../schema";
import type { MediaDiscoverFilters, MediaKind } from "../schema";
import { cn } from "@/lib/utils";

interface TVGenre {
  id: number;
  name: string;
}

interface MediaDiscoverFiltersBarProps {
  mediaType: MediaKind;
  filters: MediaDiscoverFilters;
  genres: TVGenre[];
  onChange: (filters: MediaDiscoverFilters) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

const sortIcons = {
  trending: TrendingUp,
  topRated: Star,
  newest: CalendarClock,
  alphabetical: ArrowDownAZ,
} as const;

export function MediaDiscoverFiltersBar({ mediaType, filters, genres, onChange }: MediaDiscoverFiltersBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const genreName = genres.find((g) => String(g.id) === filters.genreId)?.name;

  const activeFilters = [
    filters.genreId && { key: "genreId" as const, label: genreName ?? "Genre" },
    filters.year && { key: "year" as const, label: String(filters.year) },
    filters.minRating && { key: "minRating" as const, label: `${filters.minRating}+ ★` },
    !filters.englishOnly && { key: "englishOnly" as const, label: "All languages" },
    mediaType === "tv" && filters.airingOnly && { key: "airingOnly" as const, label: "Airing now" },
    mediaType === "movie" && filters.inTheatersOnly && { key: "inTheatersOnly" as const, label: "In theaters" },
    ...(filters.watchProviderIds ?? []).map((id) => ({
      key: `provider-${id}`,
      label: popularWatchProviders.find((p) => p.id === id)?.name ?? "Provider",
    })),
  ].filter(Boolean) as { key: string; label: string }[];

  function clearFilter(key: string) {
    if (key === "englishOnly") {
      onChange({ ...filters, englishOnly: true });
      return;
    }
    if (key === "airingOnly") {
      onChange({ ...filters, airingOnly: false });
      return;
    }
    if (key === "inTheatersOnly") {
      onChange({ ...filters, inTheatersOnly: false });
      return;
    }
    if (key.startsWith("provider-")) {
      const id = Number(key.replace("provider-", ""));
      onChange({ ...filters, watchProviderIds: filters.watchProviderIds?.filter((p) => p !== id) });
      return;
    }
    onChange({ ...filters, [key]: undefined });
  }

  function resetAll() {
    onChange({ sortBy: filters.sortBy, englishOnly: true, airingOnly: false, inTheatersOnly: false });
  }

  return (
    <div className="flex flex-col gap-2 py-4">
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {discoverSortOptions.map((opt) => {
            const Icon = sortIcons[opt.value];
            const active = filters.sortBy === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => onChange({ ...filters, sortBy: opt.value })}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs md:text-sm font-medium transition-colors shrink-0",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="size-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size={isDesktop? "sm" : "icon"} className="relative shrink-0 ml-auto">
              <div className="flex items-center gap-1">
                <SlidersHorizontal className="size-4" />
                <span className="text-sm max-md:hidden">Filters</span>
              </div>
              {activeFilters.length > 0 && (
                <Badge variant="default" className="absolute -top-1.5 -right-1.5 size-4 p-0 flex items-center justify-center text-[10px]">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent 
          side={isDesktop ? "right" : "bottom"} 
          className={isDesktop ? "w-[340px] sm:w-[380px]" : "h-[75dvh] overflow-y-auto rounded-t-2xl"}
          >
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-4 py-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-muted-foreground">Genre</Label>
                <Select
                  value={filters.genreId ?? "all"}
                  onValueChange={(value) => onChange({ ...filters, genreId: value === "all" ? undefined : value })}
                >
                  <SelectTrigger size="sm"  className="w-full">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre.id} value={String(genre.id)}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-muted-foreground">Year</Label>
                <Select
                  value={filters.year ? String(filters.year) : "all"}
                  onValueChange={(value) => onChange({ ...filters, year: value === "all" ? undefined : Number(value) })}
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Any Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Year</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-muted-foreground">Minimum rating</Label>
                <Select
                  value={filters.minRating ? String(filters.minRating) : "all"}
                  onValueChange={(value) => onChange({ ...filters, minRating: value === "all" ? undefined : Number(value) })}
                >
                  <SelectTrigger size="sm"  className="w-full">
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    {[9, 8, 7, 6, 5].map((r) => (
                      <SelectItem key={r} value={String(r)}>
                        {r}+ ★
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-muted-foreground">Where to watch</Label>
                <div className="flex flex-wrap gap-1.5">
                  {popularWatchProviders.map((provider) => {
                    const active = filters.watchProviderIds?.includes(provider.id) ?? false;
                    return (
                      <button
                        key={provider.id}
                        onClick={() =>
                          onChange({
                            ...filters,
                            watchProviderIds: active
                              ? filters.watchProviderIds?.filter((id) => id !== provider.id)
                              : [...(filters.watchProviderIds ?? []), provider.id],
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {provider.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {mediaType === "tv" && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Currently airing</p>
                    <p className="text-xs text-muted-foreground">Only shows still releasing episodes</p>
                  </div>
                  <Switch
                    checked={filters.airingOnly}
                    onCheckedChange={(checked) => onChange({ ...filters, airingOnly: checked })}
                  />
                </div>
              )}

              {mediaType === "movie" && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">In theaters</p>
                    <p className="text-xs text-muted-foreground">Only movies currently playing</p>
                  </div>
                  <Switch
                    checked={filters.inTheatersOnly}
                    onCheckedChange={(checked) => onChange({ ...filters, inTheatersOnly: checked })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">English only</p>
                  <p className="text-xs text-muted-foreground">
                    Hide non-English {mediaType === "tv" ? "shows" : "movies"}
                  </p>
                </div>
                <Switch
                  checked={filters.englishOnly}
                  onCheckedChange={(checked) => onChange({ ...filters, englishOnly: checked })}
                />
              </div>
            </div>

            <SheetFooter className="flex-row gap-2 ">
              <Button variant="ghost" className="flex-1" onClick={resetAll}>
                Reset
              </Button>
              <SheetClose asChild>
                <Button className="flex-1">Show results</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeFilters.map((f) => (
            <Badge key={f.key} variant="secondary" className="flex items-center gap-1 pr-1 font-normal">
              {f.label}
              <button onClick={() => clearFilter(f.key)} className="rounded-full hover:bg-background/50 p-0.5" aria-label={`Remove ${f.label} filter`}>
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
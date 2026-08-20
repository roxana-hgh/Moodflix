"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TVDiscoverFilters, tvSortOptions } from "@/features/media/schema";


interface TVGenre {
  id: number;
  name: string;
}

interface TVDiscoverFiltersBarProps {
  filters: TVDiscoverFilters;
  genres: TVGenre[];
  onChange: (filters: TVDiscoverFilters) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 15 }, (_, i) => currentYear - i);

export function TVDiscoverFiltersBar({ filters, genres, onChange }: TVDiscoverFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 py-4">
      <Select 
        value={filters.sortBy}
        onValueChange={(value) => onChange({ ...filters, sortBy: value as TVDiscoverFilters["sortBy"] })}
      >
        <SelectTrigger size="sm" className="min-w-32.5 sm:min-w-37.5">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {tvSortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.genreId ?? "all"}
        onValueChange={(value) => onChange({ ...filters, genreId: value === "all" ? undefined : value })}
      >
        <SelectTrigger className="min-w-32.5 sm:min-w-37.5">
          <SelectValue placeholder="Genre" />
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

      <Select
        value={filters.year ? String(filters.year) : "all"}
        onValueChange={(value) => onChange({ ...filters, year: value === "all" ? undefined : Number(value) })}
      >
        <SelectTrigger size="sm" className="min-w-32.5 sm:min-w-37.5">
          <SelectValue placeholder="Year" />
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

      <Select
        value={filters.minRating ? String(filters.minRating) : "all"}
        onValueChange={(value) => onChange({ ...filters, minRating: value === "all" ? undefined : Number(value) })}
      >
        <SelectTrigger size="sm" className="min-w-32.5 sm:min-w-37.5">
          <SelectValue placeholder="Rating" />
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

      <div className=" items-center gap-2 hidden sm:flex sm:ml-auto">
        <Label htmlFor="english-only" className="text-xs px-1 text-muted-foreground">
          English only
        </Label>
        <Switch
          id="english-only"
          size="sm"
          checked={filters.englishOnly}
          onCheckedChange={(checked) => onChange({ ...filters, englishOnly: checked })}
        />
      </div>
    </div>
  );
}
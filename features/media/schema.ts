import { z } from "zod";

export type MediaKind = "movie" | "tv";

export type DiscoverSortKey = "trending" | "topRated" | "newest" | "alphabetical";

export const discoverSortOptions: { value: DiscoverSortKey; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "topRated", label: "Top Rated" },
  { value: "newest", label: "Newest" },
  { value: "alphabetical", label: "A–Z" },
];

// Same abstract sort concept maps to different TMDB sort_by values per type
const SORT_BY_MAP: Record<MediaKind, Record<DiscoverSortKey, string>> = {
  movie: {
    trending: "popularity.desc",
    topRated: "vote_average.desc",
    newest: "primary_release_date.desc",
    alphabetical: "title.asc",
  },
  tv: {
    trending: "popularity.desc",
    topRated: "vote_average.desc",
    newest: "first_air_date.desc",
    alphabetical: "name.asc",
  },
};

export const popularWatchProviders = [
  { id: 8, name: "Netflix" },
  { id: 9, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 1899, name: "Max" },
  { id: 350, name: "Apple TV+" },
  { id: 15, name: "Hulu" },
] as const;

export const mediaDiscoverFiltersSchema = z.object({
  sortBy: z.enum(["trending", "topRated", "newest", "alphabetical"]).default("trending"),
  genreId: z.string().optional(),
  year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  englishOnly: z.boolean().default(true),
  watchProviderIds: z.array(z.number()).optional(),
  airingOnly: z.boolean().default(false), // TV only
  inTheatersOnly: z.boolean().default(false), // movie only
});

export type MediaDiscoverFilters = z.infer<typeof mediaDiscoverFiltersSchema>;

export const defaultMediaDiscoverFilters: MediaDiscoverFilters = {
  sortBy: "trending",
  englishOnly: true,
  airingOnly: false,
  inTheatersOnly: false,
};

// --- Back-compat aliases so tv-discover-browser.tsx and anything else
// referencing the old TV-specific names keeps compiling ---
export const tvDiscoverFiltersSchema = mediaDiscoverFiltersSchema;
export type TVDiscoverFilters = MediaDiscoverFilters;
export const defaultTVDiscoverFilters = defaultMediaDiscoverFilters;
export const tvSortOptions = discoverSortOptions;
export const popularTVWatchProviders = popularWatchProviders;

const NOISY_GENRE_IDS: Record<MediaKind, string[]> = {
  tv: ["10767", "10763"], // Talk, News
  movie: ["10770"], // TV Movie — low-budget filler that floods discover
};

const WATCH_REGION = "US"; // swap for user's region once you have that

export function buildDiscoverParams(
  mediaType: MediaKind,
  filters: MediaDiscoverFilters,
  page: number
) {
  const params: Record<string, string | number | boolean> = {
    sort_by: SORT_BY_MAP[mediaType][filters.sortBy],
    page,
    include_adult: false,
    "vote_count.gte": 100,
    without_genres: NOISY_GENRE_IDS[mediaType].join(","),
  };

  if (filters.englishOnly) params.with_original_language = "en";
  if (filters.genreId) params.with_genres = filters.genreId;
  if (filters.minRating) params["vote_average.gte"] = filters.minRating;

  if (filters.year) {
    params[mediaType === "tv" ? "first_air_date_year" : "primary_release_year"] = filters.year;
  }

  if (mediaType === "tv" && filters.airingOnly) {
    params.with_status = "0"; // Returning Series
  }

  if (mediaType === "movie" && filters.inTheatersOnly) {
    const today = new Date();
    const sixWeeksAgo = new Date(today);
    sixWeeksAgo.setDate(today.getDate() - 42); // typical theatrical window before streaming/digital

    params["primary_release_date.gte"] = sixWeeksAgo.toISOString().slice(0, 10);
    params["primary_release_date.lte"] = today.toISOString().slice(0, 10);
    params.with_release_type = "2|3"; // limited theatrical OR theatrical (OR, not AND)
    // year filter and "in theaters" are mutually exclusive in practice — drop year if both are set
    delete params.primary_release_year;
  }

  if (filters.watchProviderIds?.length) {
    params.with_watch_providers = filters.watchProviderIds.join("|");
    params.watch_region = WATCH_REGION;
  }

  return params;
}

export function buildDiscoverTVParams(filters: MediaDiscoverFilters, page: number) {
  return buildDiscoverParams("tv", filters, page);
}

export function buildDiscoverMovieParams(filters: MediaDiscoverFilters, page: number) {
  return buildDiscoverParams("movie", filters, page);
}
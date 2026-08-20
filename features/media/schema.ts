import { z } from "zod";

export const tvSortOptions = [
  { value: "popularity.desc", label: "Trending" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "first_air_date.desc", label: "Newest" },
  { value: "name.asc", label: "A–Z" },
] as const;

export type TVSortBy = (typeof tvSortOptions)[number]["value"];

export const tvDiscoverFiltersSchema = z.object({
  sortBy: z
    .enum(["popularity.desc", "vote_average.desc", "first_air_date.desc", "name.asc"])
    .default("popularity.desc"),
  genreId: z.string().optional(),
  year: z
    .coerce.number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1)
    .optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  englishOnly: z.boolean().default(true),
});

export type TVDiscoverFilters = z.infer<typeof tvDiscoverFiltersSchema>;

export const defaultTVDiscoverFilters: TVDiscoverFilters = {
  sortBy: "popularity.desc",
  englishOnly: true,
};

// Talk (10767) and News (10763) dominate "popular" sort with regional
// programming that isn't scripted TV people are browsing for.
const NOISY_TV_GENRE_IDS = ["10767", "10763"];

/** Single source of truth for discover/tv query params — used server-side
 *  (queries.ts, hits TMDB directly) and client-side (hooks.ts, hits the
 *  /tmdb proxy) so the two never drift apart. */
export function buildDiscoverTVParams(filters: TVDiscoverFilters, page: number) {
  const params: Record<string, string | number | boolean> = {
    sort_by: filters.sortBy,
    page,
    include_adult: false,
    "vote_count.gte": 100,
    without_genres: NOISY_TV_GENRE_IDS.join(","),
  };

  if (filters.englishOnly) params.with_original_language = "en";
  if (filters.genreId) params.with_genres = filters.genreId;
  if (filters.year) params.first_air_date_year = filters.year;
  if (filters.minRating) params["vote_average.gte"] = filters.minRating;

  return params;
}
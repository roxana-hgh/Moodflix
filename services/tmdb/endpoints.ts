import "server-only";
import { tmdbFetch, type TmdbParams } from "./client";
import type {
  TMDBGenre,
  TMDBKeyword,
  TMDBMovieDetails,
  TMDBMovieResult,
  TMDBMultiSearchResponse,
  TMDBPaginatedResponse,
  TMDBPersonDetails,
  TMDBSeasonDetails,
  TMDBTVDetails,
  TMDBTVResult,
} from "./types";

/**
 * Typed TMDB endpoints. Raw responses only, no mapping or business logic.
 *
 * Movie and TV details always request the same `append_to_response`, so the
 * detail page, the cast dialog and list metadata all share one cached response
 * per title instead of each making its own request.
 */
const DETAIL_PARAMS = {
  append_to_response: "credits,images,recommendations,similar,videos,reviews",
  // Textless and English artwork only. Keeps the payload (and the cache entry) small.
  include_image_language: "en,null",
} satisfies TmdbParams;

type Page<T> = TMDBPaginatedResponse<T>;
type TimeWindow = "day" | "week";

export const tmdb = {
  movie: {
    details: (id: number) => tmdbFetch<TMDBMovieDetails>(`/movie/${id}`, { params: DETAIL_PARAMS, revalidate: "detail" }),
    trending: (window: TimeWindow) => tmdbFetch<Page<TMDBMovieResult>>(`/trending/movie/${window}`, { revalidate: "list" }),
    popular: (page = 1) => tmdbFetch<Page<TMDBMovieResult>>("/movie/popular", { params: { page }, revalidate: "list" }),
    topRated: (page = 1) => tmdbFetch<Page<TMDBMovieResult>>("/movie/top_rated", { params: { page }, revalidate: "list" }),
    discover: (params: TmdbParams) => tmdbFetch<Page<TMDBMovieResult>>("/discover/movie", { params, revalidate: "list" }),
    genres: () => tmdbFetch<{ genres: TMDBGenre[] }>("/genre/movie/list", { revalidate: "static" }),
  },

  tv: {
    details: (id: number) => tmdbFetch<TMDBTVDetails>(`/tv/${id}`, { params: DETAIL_PARAMS, revalidate: "detail" }),
    season: (tvId: number, seasonNumber: number) =>
      tmdbFetch<TMDBSeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`, { revalidate: "detail" }),
    trending: (window: TimeWindow) => tmdbFetch<Page<TMDBTVResult>>(`/trending/tv/${window}`, { revalidate: "list" }),
    popular: (page = 1) => tmdbFetch<Page<TMDBTVResult>>("/tv/popular", { params: { page }, revalidate: "list" }),
    topRated: (page = 1) => tmdbFetch<Page<TMDBTVResult>>("/tv/top_rated", { params: { page }, revalidate: "list" }),
    discover: (params: TmdbParams) => tmdbFetch<Page<TMDBTVResult>>("/discover/tv", { params, revalidate: "list" }),
    genres: () => tmdbFetch<{ genres: TMDBGenre[] }>("/genre/tv/list", { revalidate: "static" }),
  },

  person: {
    details: (id: number) =>
      tmdbFetch<TMDBPersonDetails>(`/person/${id}`, {
        params: { append_to_response: "movie_credits,tv_credits" },
        revalidate: "detail",
      }),
  },

  search: {
    multi: (query: string) =>
      tmdbFetch<TMDBMultiSearchResponse>("/search/multi", {
        params: { query, include_adult: false },
        revalidate: "list",
      }),
    movie: (query: string) =>
      tmdbFetch<Page<TMDBMovieResult>>("/search/movie", { params: { query, include_adult: false }, revalidate: "list" }),
    tv: (query: string) =>
      tmdbFetch<Page<TMDBTVResult>>("/search/tv", { params: { query, include_adult: false }, revalidate: "list" }),
    // A term like "forest" always resolves to the same keyword id.
    keyword: (query: string) => tmdbFetch<Page<TMDBKeyword>>("/search/keyword", { params: { query }, revalidate: "static" }),
  },
};

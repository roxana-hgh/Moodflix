import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isTmdbNotFound, tmdb } from "@/services/tmdb";
import type { TMDBGenre, TMDBMovieDetails, TMDBPaginatedResponse, TMDBTVDetails } from "@/services/tmdb/types";
import type { MediaCardItem } from "@/types/media";
import { buildDiscoverMovieParams, buildDiscoverTVParams } from "./schema";
import type { MediaDiscoverFilters } from "./schema";
import {
  toMediaCardItem,
  toMovieDetail,
  toSeasonDetail,
  toTVDetail,
  type CastMember,
  type MediaDetail,
  type SeasonDetail,
} from "./types";

// Every function here is a `'use cache'` boundary: results are shared by all users
// and land in the static shell, so a page only reaches TMDB on a cold cache.
// Results are mapped before they are cached, which keeps the in-memory entries small.

type MediaKind = "movie" | "tv";

const tag = {
  list: (name: string) => `tmdb:list:${name}`,
  detail: (type: MediaKind, id: number) => `tmdb:${type}:${id}`,
  person: (id: number) => `tmdb:person:${id}`,
};

function toId(id: string | number): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** Returns null for TMDB 404s so a bad id is cached instead of retried. */
async function orNullOnNotFound<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (err) {
    if (isTmdbNotFound(err)) return null;
    throw err;
  }
}

// ───────────────────────── Lists ─────────────────────────

export async function getTrendingMovies(window: "day" | "week"): Promise<MediaCardItem[]> {
  "use cache";
  cacheLife("tmdb-list");
  cacheTag(tag.list(`trending-movie-${window}`));

  const data = await tmdb.movie.trending(window);
  return data.results.map(toMediaCardItem);
}

export async function getTrendingTv(window: "day" | "week"): Promise<MediaCardItem[]> {
  "use cache";
  cacheLife("tmdb-list");
  cacheTag(tag.list(`trending-tv-${window}`));

  const data = await tmdb.tv.trending(window);
  return data.results.map(toMediaCardItem);
}

export async function getPopularMovies(page = 1): Promise<MediaCardItem[]> {
  "use cache";
  cacheLife("tmdb-list");
  cacheTag(tag.list("popular-movie"));

  const data = await tmdb.movie.popular(page);
  return data.results.map((item) => toMediaCardItem({ ...item, media_type: "movie" }));
}

export async function getPopularTv(page = 1): Promise<MediaCardItem[]> {
  "use cache";
  cacheLife("tmdb-list");
  cacheTag(tag.list("popular-tv"));

  const data = await tmdb.tv.popular(page);
  return data.results.map((item) => toMediaCardItem({ ...item, media_type: "tv" }));
}

export async function getTopRatedMovies(page = 1): Promise<MediaCardItem[]> {
  "use cache";
  cacheLife("tmdb-list");
  cacheTag(tag.list("top-rated-movie"));

  const data = await tmdb.movie.topRated(page);
  return data.results.map((item) => toMediaCardItem({ ...item, media_type: "movie" }));
}

export async function getTopRatedTv(page = 1): Promise<MediaCardItem[]> {
  "use cache";
  cacheLife("tmdb-list");
  cacheTag(tag.list("top-rated-tv"));

  const data = await tmdb.tv.topRated(page);
  return data.results.map((item) => toMediaCardItem({ ...item, media_type: "tv" }));
}

// ───────────────────────── Discover ─────────────────────────

export type DiscoverPage = TMDBPaginatedResponse<MediaCardItem>;

export async function discoverMovies(filters: MediaDiscoverFilters, page = 1): Promise<DiscoverPage> {
  "use cache";
  cacheLife("tmdb-list");
  cacheTag(tag.list("discover-movie"));

  const data = await tmdb.movie.discover(buildDiscoverMovieParams(filters, page));
  // discover doesn't return media_type, so inject it before mapping
  return { ...data, results: data.results.map((item) => toMediaCardItem({ ...item, media_type: "movie" })) };
}

export async function discoverTVShows(filters: MediaDiscoverFilters, page = 1): Promise<DiscoverPage> {
  "use cache";
  cacheLife("tmdb-list");
  cacheTag(tag.list("discover-tv"));

  const data = await tmdb.tv.discover(buildDiscoverTVParams(filters, page));
  return { ...data, results: data.results.map((item) => toMediaCardItem({ ...item, media_type: "tv" })) };
}

// ───────────────────────── Genres ─────────────────────────

export async function getMovieGenres(): Promise<TMDBGenre[]> {
  "use cache";
  cacheLife("tmdb-static");
  cacheTag(tag.list("genres-movie"));

  return (await tmdb.movie.genres()).genres;
}

export async function getTVGenres(): Promise<TMDBGenre[]> {
  "use cache";
  cacheLife("tmdb-static");
  cacheTag(tag.list("genres-tv"));

  return (await tmdb.tv.genres()).genres;
}

// ───────────────────────── Details ─────────────────────────

export async function getMovieDetails(id: string | number): Promise<MediaDetail | null> {
  "use cache";
  cacheLife("tmdb-detail");
  const movieId = toId(id);
  if (!movieId) return null;
  cacheTag(tag.detail("movie", movieId));

  const raw = await orNullOnNotFound(tmdb.movie.details(movieId));
  return raw ? toMovieDetail(raw) : null;
}

export async function getTVDetails(id: string | number): Promise<MediaDetail | null> {
  "use cache";
  cacheLife("tmdb-detail");
  const tvId = toId(id);
  if (!tvId) return null;
  cacheTag(tag.detail("tv", tvId));

  const raw = await orNullOnNotFound(tmdb.tv.details(tvId));
  return raw ? toTVDetail(raw) : null;
}

export async function getSeasonDetail(tvId: string | number, seasonNumber: string | number): Promise<SeasonDetail | null> {
  "use cache";
  cacheLife("tmdb-detail");
  const id = toId(tvId);
  const season = Number(seasonNumber);
  if (!id || !Number.isInteger(season) || season < 0) return null;
  cacheTag(tag.detail("tv", id));

  const raw = await orNullOnNotFound(tmdb.tv.season(id, season));
  return raw ? toSeasonDetail(raw) : null;
}

/** Full cast (the detail page keeps only the first 12). Reuses the cached details response. */
export async function getMediaCast(type: MediaKind, id: number): Promise<CastMember[]> {
  "use cache";
  cacheLife("tmdb-detail");
  cacheTag(tag.detail(type, id));

  const raw: TMDBMovieDetails | TMDBTVDetails = type === "movie" ? await tmdb.movie.details(id) : await tmdb.tv.details(id);
  return raw.credits.cast.map((member) => ({
    id: member.id,
    name: member.name,
    character: member.character,
    profilePath: member.profile_path,
  }));
}

// ───────────────────────── List item metadata ─────────────────────────

export interface MediaMeta {
  genreIds: number[];
  runtimeMinutes: number | null;
  voteAverage: number | null;
}

export const EMPTY_MEDIA_META: MediaMeta = { genreIds: [], runtimeMinutes: null, voteAverage: null };

/** Display fields cached on `ListItem`. Reuses the cached details response. */
export async function getMediaMeta(type: "MOVIE" | "TV", id: number): Promise<MediaMeta> {
  "use cache";
  cacheLife("tmdb-detail");
  cacheTag(tag.detail(type === "MOVIE" ? "movie" : "tv", id));

  if (type === "MOVIE") {
    const d = await tmdb.movie.details(id);
    return {
      genreIds: d.genres.map((g) => g.id),
      runtimeMinutes: d.runtime || null,
      voteAverage: d.vote_average || null,
    };
  }

  const d = await tmdb.tv.details(id);
  const perEpisode = d.episode_run_time?.[0] || d.last_episode_to_air?.runtime || null;
  return {
    genreIds: d.genres.map((g) => g.id),
    runtimeMinutes: perEpisode && d.number_of_episodes ? perEpisode * d.number_of_episodes : null,
    voteAverage: d.vote_average || null,
  };
}

// ───────────────────────── Search ─────────────────────────

export async function searchMedia(query: string): Promise<MediaCardItem[]> {
  "use cache";
  cacheLife("tmdb-list");

  const data = await tmdb.search.multi(query);
  return data.results
    .filter((result) => result.media_type === "movie" || result.media_type === "tv")
    .map(toMediaCardItem);
}

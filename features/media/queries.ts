import 'server-only';
import { serverApi } from '@/services/tmdb/client';
import { toMediaCardItem, toMovieDetail, toTVDetail } from './types';
import type {
  TMDBPaginatedResponse,
  TMDBTVResult,
  TMDBMovieResult,
  TMDBMovieDetails,
  TMDBTVDetails,
  TMDBGenre,
} from '@/services/tmdb/types';
import type { MediaCardItem } from '@/types/media';
import { buildDiscoverMovieParams, buildDiscoverTVParams } from '@/features/media/schema';
import type { MediaDiscoverFilters, TVDiscoverFilters } from '@/features/media/schema';

export async function getTrendingTv(window: 'day' | 'week'): Promise<MediaCardItem[]> {
  const data = await serverApi<TMDBPaginatedResponse<TMDBTVResult>>(`/trending/tv/${window}`, {
    next: { revalidate: 3600 },
  });

  return data.results.map(toMediaCardItem);
}

export async function getTrendingMovies(window: 'day' | 'week'): Promise<MediaCardItem[]> {
  const data = await serverApi<TMDBPaginatedResponse<TMDBMovieResult>>(`/trending/movie/${window}`, {
    next: { revalidate: 3600 },
  });

  return data.results.map(toMediaCardItem);
}

const DETAIL_APPEND = "credits,images,recommendations,similar";

export async function getMovieDetails(id: string | number) {
  const raw = await serverApi<TMDBMovieDetails>(`/movie/${id}`, {
    params: { append_to_response: DETAIL_APPEND },
    next: { revalidate: 60 * 60 * 12 },
  });

  return toMovieDetail(raw);
}

export async function getTVDetails(id: string | number) {
  const raw = await serverApi<TMDBTVDetails>(`/tv/${id}`, {
    params: { append_to_response: DETAIL_APPEND },
    next: { revalidate: 60 * 60 * 12 },
  });

  return toTVDetail(raw);
}

export async function discoverTVShows(
  filters: TVDiscoverFilters,
  page = 1
): Promise<TMDBPaginatedResponse<MediaCardItem>> {
  const data = await serverApi<TMDBPaginatedResponse<TMDBTVResult>>('/discover/tv', {
    params: buildDiscoverTVParams(filters, page),
    next: { revalidate: 3600 },
  });

  return {
    ...data,
    // discover/tv doesn't return media_type — inject it before mapping,
    // same gotcha as the recommendations endpoint
    results: data.results.map((item) => toMediaCardItem({ ...item, media_type: 'tv' })),
  };
}

export async function getTVGenres(): Promise<TMDBGenre[]> {
  const data = await serverApi<{ genres: TMDBGenre[] }>('/genre/tv/list', {
    next: { revalidate: 60 * 60 * 24 }, // genre list is basically static
  });

  return data.genres;
}


export async function discoverMovies(
  filters: MediaDiscoverFilters,
  page = 1
): Promise<TMDBPaginatedResponse<MediaCardItem>> {
  const data = await serverApi<TMDBPaginatedResponse<TMDBMovieResult>>('/discover/movie', {
    params: buildDiscoverMovieParams(filters, page),
    next: { revalidate: 3600 },
  });

  return {
    ...data,
    results: data.results.map((item) => toMediaCardItem({ ...item, media_type: 'movie' })),
  };
}

export async function getMovieGenres(): Promise<TMDBGenre[]> {
  const data = await serverApi<{ genres: TMDBGenre[] }>('/genre/movie/list', {
    next: { revalidate: 60 * 60 * 24 },
  });

  return data.genres;
}


export async function getPopularMovies(page = 1): Promise<MediaCardItem[]> {
  const data = await serverApi<TMDBPaginatedResponse<TMDBMovieResult>>('/movie/popular', {
    params: { page },
    next: { revalidate: 3600 },
  });

  return data.results.map((item) => toMediaCardItem({ ...item, media_type: 'movie' }));
}

export async function getPopularTv(page = 1): Promise<MediaCardItem[]> {
  const data = await serverApi<TMDBPaginatedResponse<TMDBTVResult>>('/tv/popular', {
    params: { page },
    next: { revalidate: 3600 },
  });

  return data.results.map((item) => toMediaCardItem({ ...item, media_type: 'tv' }));
}

export async function getTopRatedMovies(page = 1): Promise<MediaCardItem[]> {
  const data = await serverApi<TMDBPaginatedResponse<TMDBMovieResult>>('/movie/top_rated', {
    params: { page },
    next: { revalidate: 3600 },
  });

  return data.results.map((item) => toMediaCardItem({ ...item, media_type: 'movie' }));
}

export async function getTopRatedTv(page = 1): Promise<MediaCardItem[]> {
  const data = await serverApi<TMDBPaginatedResponse<TMDBTVResult>>('/tv/top_rated', {
    params: { page },
    next: { revalidate: 3600 },
  });

  return data.results.map((item) => toMediaCardItem({ ...item, media_type: 'tv' }));
}
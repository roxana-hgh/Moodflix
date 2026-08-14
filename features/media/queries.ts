import 'server-only';
import { serverApi } from '@/services/tmdb/client';
import { toMediaCardItem, toMovieDetail, toTVDetail } from './types';
import type { TMDBPaginatedResponse, TMDBTVResult, TMDBMovieResult, TMDBMovieDetails, TMDBTVDetails } from '@/services/tmdb/types';
import type { MediaCardItem } from '@/types/media';

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
    next: { revalidate: 60 * 60 * 12 }, // 12h — detail data is far less volatile than trending
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
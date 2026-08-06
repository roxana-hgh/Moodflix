import 'server-only';
import { serverApi } from '@/services/tmdb/client';
import { toMediaCardItem } from './types';
import type { TMDBPaginatedResponse, TMDBTVResult, TMDBMovieResult } from '@/services/tmdb/types';
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
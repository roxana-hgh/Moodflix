const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export type TmdbImageSize = 'w200' | 'w342' | 'w500' | 'w780' | 'original';

export function tmdbImageUrl(path: string | null, size: TmdbImageSize = 'w342') {
  if (!path) return '/images/poster-placeholder.png';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
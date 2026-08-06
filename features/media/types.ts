import type { TMDBMediaResult, TMDBTVResult } from '@/services/tmdb/types';
import type { MediaCardItem } from '@/types/media';

function isTVResult(result: TMDBMediaResult): result is TMDBTVResult {
  if (result.media_type) return result.media_type === 'tv';
  return 'first_air_date' in result;
}

export function toMediaCardItem(result: TMDBMediaResult): MediaCardItem {
  const isTV = isTVResult(result);
  const rawDate = isTV ? result.first_air_date : result.release_date;

  return {
    id: result.id,
    title: isTV ? result.name : result.title,
    posterPath: result.poster_path,
    voteAverage: result.vote_average,
    releaseYear: rawDate ? rawDate.slice(0, 4) : null,
    overview: result.overview,
    mediaType: isTV ? 'tv' : 'movie',
  };
}
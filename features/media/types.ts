import type { TMDBCastMember, TMDBMediaResult, TMDBMovieDetails, TMDBMovieResult, TMDBTVDetails, TMDBTVResult } from '@/services/tmdb/types';
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

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export interface MediaDetail {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  tagline: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: string;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  status: string;
  homepage: string | null;
  genres: string[];
  runtime: number | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  networks: string[];
  productionCountries: string[];
  spokenLanguages: string[];
  cast: CastMember[];
  backdrops: string[];
  recommendations: MediaCardItem[];
  similar: MediaCardItem[];
}

function toCastMember(raw: TMDBCastMember): CastMember {
  return {
    id: raw.id,
    name: raw.name,
    character: raw.character,
    profilePath: raw.profile_path,
  };
}

export function toMovieDetail(raw: TMDBMovieDetails): MediaDetail {
  return {
    id: raw.id,
    mediaType: "movie",
    title: raw.title,
    tagline: raw.tagline,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    releaseYear: raw.release_date ? raw.release_date.slice(0, 4) : "",
    releaseDate: raw.release_date,
    voteAverage: raw.vote_average,
    voteCount: raw.vote_count,
    status: raw.status,
    homepage: raw.homepage,
    genres: raw.genres.map((g) => g.name),
    runtime: raw.runtime,
    numberOfSeasons: null,
    numberOfEpisodes: null,
    networks: [],
    productionCountries: raw.production_countries.map((c) => c.name),
    spokenLanguages: raw.spoken_languages.map((l) => l.english_name),
    cast: raw.credits.cast.slice(0, 12).map(toCastMember),
    backdrops: raw.images.backdrops.slice(0, 12).map((b) => b.file_path),
    // media_type injected manually — movie-scoped recommendations don't carry it
    recommendations: raw.recommendations.results.map((item) =>
      toMediaCardItem({ ...item, media_type: "movie" } as TMDBMovieResult)
    ),
    similar: raw.similar.results.map((item) =>
      toMediaCardItem({ ...item, media_type: "movie" } as TMDBMovieResult)
    ),
  };
}

export function toTVDetail(raw: TMDBTVDetails): MediaDetail {
  return {
    id: raw.id,
    mediaType: "tv",
    title: raw.name,
    tagline: raw.tagline,
    overview: raw.overview,
    posterPath: raw.poster_path,
    backdropPath: raw.backdrop_path,
    releaseYear: raw.first_air_date ? raw.first_air_date.slice(0, 4) : "",
    releaseDate: raw.first_air_date,
    voteAverage: raw.vote_average,
    voteCount: raw.vote_count,
    status: raw.status,
    homepage: raw.homepage,
    genres: raw.genres.map((g) => g.name),
    runtime: raw.last_episode_to_air?.runtime ?? null,
    numberOfSeasons: raw.number_of_seasons,
    numberOfEpisodes: raw.number_of_episodes,
    networks: raw.networks.map((n) => n.name),
    productionCountries: raw.production_countries.map((c) => c.name),
    spokenLanguages: raw.spoken_languages.map((l) => l.english_name),
    cast: raw.credits.cast.slice(0, 12).map(toCastMember),
    backdrops: raw.images.backdrops.slice(0, 12).map((b) => b.file_path),
    recommendations: raw.recommendations.results.map((item) =>
      toMediaCardItem({ ...item, media_type: "tv" } as TMDBTVResult)
    ),
    similar: raw.similar.results.map((item) =>
      toMediaCardItem({ ...item, media_type: "tv" } as TMDBTVResult)
    ),
  };
}
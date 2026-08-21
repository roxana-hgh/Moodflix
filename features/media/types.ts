import type {
  TMDBCastMember,
  TMDBMediaResult,
  TMDBMovieDetails,
  TMDBMovieResult,
  TMDBSeasonDetails,
  TMDBTVDetails,
  TMDBTVResult,
} from "@/services/tmdb/types";
import type { MediaCardItem } from "@/types/media";

function isTVResult(result: TMDBMediaResult): result is TMDBTVResult {
  if (result.media_type) return result.media_type === "tv";
  return "first_air_date" in result;
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
    mediaType: isTV ? "tv" : "movie",
  };
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
}

export type Creator = {
  id: number;
  name: string;
  profilePath: string | null;
};

export type SeasonSummary = {
  id: number;
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
  overview: string;
};

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
  creators: Creator[];
  seasons: SeasonSummary[];
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
    creators: raw.credits.crew
      .filter((c) => c.job === "Director")
      .map((c) => ({ id: c.id, name: c.name, profilePath: c.profile_path })),
    seasons: [],
    cast: raw.credits.cast.slice(0, 12).map(toCastMember),
    backdrops: raw.images.backdrops.slice(0, 12).map((b) => b.file_path),
    recommendations: raw.recommendations.results.map((item) =>
      toMediaCardItem({ ...item, media_type: "movie" } as TMDBMovieResult),
    ),
    similar: raw.similar.results.map((item) =>
      toMediaCardItem({ ...item, media_type: "movie" } as TMDBMovieResult),
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
    creators: raw.created_by.map((c) => ({
      id: c.id,
      name: c.name,
      profilePath: c.profile_path,
    })),
    seasons: raw.seasons
      .filter((s) => s.season_number !== 0)
      .map((s) => ({
        id: s.id,
        seasonNumber: s.season_number,
        name: s.name,
        episodeCount: s.episode_count,
        airDate: s.air_date,
        posterPath: s.poster_path,
        overview: s.overview,
      })),
    cast: raw.credits.cast.slice(0, 12).map(toCastMember),
    backdrops: raw.images.backdrops.slice(0, 12).map((b) => b.file_path),
    recommendations: raw.recommendations.results.map((item) =>
      toMediaCardItem({ ...item, media_type: "tv" } as TMDBTVResult),
    ),
    similar: raw.similar.results.map((item) =>
      toMediaCardItem({ ...item, media_type: "tv" } as TMDBTVResult),
    ),
  };
}

export type EpisodeSummary = {
  id: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  runtime: number | null;
  stillPath: string | null;
  voteAverage: number;
};

export type SeasonDetail = {
  id: number;
  seasonNumber: number;
  name: string;
  overview: string;
  posterPath: string | null;
  airDate: string | null;
  episodes: EpisodeSummary[];
};

export function toSeasonDetail(raw: TMDBSeasonDetails): SeasonDetail {
  return {
    id: raw.id,
    seasonNumber: raw.season_number,
    name: raw.name,
    overview: raw.overview,
    posterPath: raw.poster_path,
    airDate: raw.air_date,
    episodes: raw.episodes.map((e) => ({
      id: e.id,
      episodeNumber: e.episode_number,
      name: e.name,
      overview: e.overview,
      airDate: e.air_date,
      runtime: e.runtime,
      stillPath: e.still_path,
      voteAverage: e.vote_average,
    })),
  };
}
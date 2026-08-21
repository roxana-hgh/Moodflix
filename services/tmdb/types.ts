export interface TMDBMovieResult {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  video: boolean;
  original_language: string;
  media_type?: 'movie';
}

export interface TMDBTVResult {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  origin_country: string[];
  media_type?: 'tv';
}

export type TMDBMediaResult = TMDBMovieResult | TMDBTVResult;

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}


export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDBNetwork {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBCreator {
  id: number;
  credit_id: string;
  name: string;
  gender: number | null;
  profile_path: string | null;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_count: number;
  air_date: string | null;
  poster_path: string | null;
  vote_average: number;
}

export interface TMDBImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
}

export interface TMDBImages {
  backdrops: TMDBImage[];
  posters: TMDBImage[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  season_number: number;
  episode_number: number;
  runtime: number | null;
  air_date: string;
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  status: string;
  homepage: string | null;
  genres: TMDBGenre[];
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  spoken_languages: TMDBSpokenLanguage[];
  credits: TMDBCredits;
  images: TMDBImages;
  recommendations: TMDBPaginatedResponse<TMDBMovieResult>;
  similar: TMDBPaginatedResponse<TMDBMovieResult>;
}

export interface TMDBTVDetails {
  id: number;
  name: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  homepage: string | null;
  genres: TMDBGenre[];
  created_by: TMDBCreator[];        // NEW
  seasons: TMDBSeason[];            // NEW
  networks: TMDBNetwork[];
  production_countries: TMDBProductionCountry[];
  spoken_languages: TMDBSpokenLanguage[];
  last_episode_to_air: TMDBEpisode | null;
  vote_average: number;
  vote_count: number;
  credits: TMDBCredits;
  images: TMDBImages;
  recommendations: TMDBPaginatedResponse<TMDBTVResult>;
  similar: TMDBPaginatedResponse<TMDBTVResult>;
}

export interface TMDBSeasonEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  season_number: number;
  poster_path: string | null;
  vote_average: number;
  episodes: TMDBSeasonEpisode[];
}

export interface TMDBPersonResult {
  id: number;
  name: string;
  media_type: "person";
  profile_path: string | null;
  popularity: number;
  known_for_department: string;
}

export type TMDBMultiSearchResult =
  | (TMDBMovieResult & { media_type: "movie" })
  | (TMDBTVResult & { media_type: "tv" })
  | TMDBPersonResult;

export type TMDBMultiSearchResponse = TMDBPaginatedResponse<TMDBMultiSearchResult>;
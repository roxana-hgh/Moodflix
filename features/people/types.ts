import type {
  TMDBPersonDetails,
  TMDBPersonMovieCastCredit,
  TMDBPersonMovieCrewCredit,
  TMDBPersonTvCastCredit,
  TMDBPersonTvCrewCredit,
} from "@/services/tmdb/types";

export interface Person {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  age: number | null;
  placeOfBirth: string | null;
  profilePath: string | null;
  knownForDepartment: string;
}


export interface PersonCreditItem {
  id: number; // tmdbId
  mediaType: "movie" | "tv";
  title: string;
  overview: string;
  posterPath: string | null;
  releaseYear: string | null;
  role: string;
  voteAverage: number;
  popularity: number;
}

function calculateAge(birthday: string | null, deathday: string | null): number | null {
  if (!birthday) return null;
  const start = new Date(birthday);
  const end = deathday ? new Date(deathday) : new Date();
  let age = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) age--;
  return age;
}

function yearFrom(dateStr?: string | null): string | null {
  return dateStr ? dateStr.slice(0, 4) || null : null;
}

export function mapPersonDetails(raw: TMDBPersonDetails): Person {
  return {
    id: raw.id,
    name: raw.name,
    biography: raw.biography || null,
    birthday: raw.birthday,
    deathday: raw.deathday,
    age: calculateAge(raw.birthday, raw.deathday),
    placeOfBirth: raw.place_of_birth,
    profilePath: raw.profile_path,
    knownForDepartment: raw.known_for_department,
  };
}

export function mapPersonMovieCredits(
  cast: TMDBPersonMovieCastCredit[] = [],
  crew: TMDBPersonMovieCrewCredit[] = []
): PersonCreditItem[] {
  const byId = new Map<number, PersonCreditItem>();

  for (const c of cast) {
    byId.set(c.id, {
      id: c.id,
      mediaType: "movie",
      title: c.title,
      posterPath: c.poster_path,
      releaseYear: yearFrom(c.release_date),
      role: c.character || "Cast",
      voteAverage: c.vote_average,
      popularity: c.popularity,
      overview: c.overview ?? ""
    });
  }
  for (const c of crew) {
    if (byId.has(c.id)) continue;
    byId.set(c.id, {
      id: c.id,
      mediaType: "movie",
      title: c.title,
      posterPath: c.poster_path,
      releaseYear: yearFrom(c.release_date),
      role: c.job,
      voteAverage: c.vote_average,
      popularity: c.popularity,
      overview: c.overview ?? ""
    });
  }

  return Array.from(byId.values()).sort((a, b) =>
    (b.releaseYear ?? "0").localeCompare(a.releaseYear ?? "0")
  );
}

export function mapPersonTvCredits(
  cast: TMDBPersonTvCastCredit[] = [],
  crew: TMDBPersonTvCrewCredit[] = []
): PersonCreditItem[] {
  const byId = new Map<number, PersonCreditItem>();

  for (const c of cast) {
    byId.set(c.id, {
      id: c.id,
      mediaType: "tv",
      title: c.name,
      posterPath: c.poster_path,
      releaseYear: yearFrom(c.first_air_date),
      role: c.character || "Cast",
      voteAverage: c.vote_average,
      popularity: c.popularity,
      overview: c.overview ?? ""
    });
  }
  for (const c of crew) {
    if (byId.has(c.id)) continue;
    byId.set(c.id, {
      id: c.id,
      mediaType: "tv",
      title: c.name,
      posterPath: c.poster_path,
      releaseYear: yearFrom(c.first_air_date),
      role: c.job,
      voteAverage: c.vote_average,
      popularity: c.popularity,
      overview: c.overview ?? ""
    });
  }

  return Array.from(byId.values()).sort((a, b) =>
    (b.releaseYear ?? "0").localeCompare(a.releaseYear ?? "0")
  );
}



export type ListMediaType = "MOVIE" | "TV";

export function toListMediaType(mediaType: "movie" | "tv"): ListMediaType {
  return mediaType.toUpperCase() as ListMediaType;
}

export function toFavoritedKey(tmdbId: number, mediaType: ListMediaType): string {
  return `${mediaType}-${tmdbId}`;
}
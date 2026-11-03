import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isTmdbNotFound, tmdb } from "@/services/tmdb";
import {
  mapPersonDetails,
  mapPersonMovieCredits,
  mapPersonTvCredits,
  type Person,
  type PersonCreditItem,
} from "./types";

export interface PersonDetailsResult {
  person: Person;
  movieCredits: PersonCreditItem[];
  tvCredits: PersonCreditItem[];
}

/** Returns null when TMDB has no such person. */
export async function getPersonDetails(personId: number): Promise<PersonDetailsResult | null> {
  "use cache";
  cacheLife("tmdb-detail");
  cacheTag(`tmdb:person:${personId}`);

  try {
    const raw = await tmdb.person.details(personId);
    return {
      person: mapPersonDetails(raw),
      movieCredits: mapPersonMovieCredits(raw.movie_credits?.cast, raw.movie_credits?.crew),
      tvCredits: mapPersonTvCredits(raw.tv_credits?.cast, raw.tv_credits?.crew),
    };
  } catch (err) {
    if (isTmdbNotFound(err)) return null;
    throw err;
  }
}

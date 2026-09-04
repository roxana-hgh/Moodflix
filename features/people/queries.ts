import "server-only";
import { serverApi } from "@/services/tmdb/client";

import type { TMDBPersonDetails } from "@/services/tmdb/types";
import { getCurrentUserId } from "@/lib/auth";
import { getFavoritedKeys, getWatchedKeys } from "@/features/lists/queries";

import {
  mapPersonDetails,
  mapPersonMovieCredits,
  mapPersonTvCredits,
  type Person,
  type PersonCreditItem,
} from "./types";
import { toListMediaType } from "@/features/lists/types";

export interface PersonDetailsResult {
  person: Person;
  movieCredits: PersonCreditItem[];
  tvCredits: PersonCreditItem[];
}

export function personDetailsEndpoint(personId: number) {
  return `/person/${personId}?append_to_response=movie_credits,tv_credits`;
}

export async function getPersonDetails(personId: number): Promise<PersonDetailsResult> {
  const raw = await serverApi<TMDBPersonDetails>(personDetailsEndpoint(personId));

  return {
    person: mapPersonDetails(raw),
    movieCredits: mapPersonMovieCredits(raw.movie_credits?.cast, raw.movie_credits?.crew),
    tvCredits: mapPersonTvCredits(raw.tv_credits?.cast, raw.tv_credits?.crew),
  };
}

export interface CreditStatusMaps {
  favoritedKeys: Set<string>;
  watchedKeys: Set<string>;
}

export async function getPersonCreditsStatus(
  credits: PersonCreditItem[]
): Promise<CreditStatusMaps> {
  const userId = await getCurrentUserId();

  if (!userId || credits.length === 0) {
    return { favoritedKeys: new Set(), watchedKeys: new Set() };
  }

  const keyed = credits.map((item) => ({
    tmdbId: item.id,
    mediaType: toListMediaType(item.mediaType),
  }));

  const [favoritedKeys, watchedKeys] = await Promise.all([
    getFavoritedKeys(userId, keyed),
    getWatchedKeys(userId, keyed),
  ]);

  return { favoritedKeys, watchedKeys };
}
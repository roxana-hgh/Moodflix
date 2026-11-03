import type { ListMediaType } from "./types";

/** React Query keys for list data. Plain module so server components can use them too. */
export const listsKeys = {
  all: ["lists"] as const,
  withPreview: ["lists", "withPreview"] as const,
  membership: (tmdbId: number, mediaType: ListMediaType) => ["lists", "membership", tmdbId, mediaType] as const,
  // Outside the "lists" prefix on purpose: toggles patch it in place instead of refetching.
  library: ["viewer-library"] as const,
};

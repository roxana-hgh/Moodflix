"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addItemToList,
  removeItemFromList,
  toggleQuickList,
  createCustomList,
  updateList,
  deleteList,
  getUserListsAction,
  getUserListsWithPreviewAction,
  getItemListIdsAction,
  getViewerLibraryAction,
} from "./actions";
import type {
  AddToListInput,
  RemoveFromListInput,
  ToggleQuickListInput,
  CreateListInput,
  UpdateListInput,
  DeleteListInput,
} from "./schema";
import { authClient } from "@/lib/auth-client";
import { listsKeys } from "./keys";
import { toFavoritedKey, type ListMediaType, type SystemListType, type ViewerLibrary } from "./types";

function invalidateAllListQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: listsKeys.all });
  queryClient.invalidateQueries({ queryKey: listsKeys.withPreview });
}

// ───────────────────────── Viewer library ─────────────────────────
// The signed-in user's favorites / watched / watchlist keys. Seeded from the server by
// <ViewerLibrarySeed /> in the main layout, so pages that show TMDB content never
// need to read the session themselves and can be served from cache.

type LibrarySets = Record<SystemListType, Set<string>>;

// One set per data snapshot, shared by every card instead of rebuilt per card.
const setsCache = new WeakMap<ViewerLibrary, LibrarySets>();
function toSets(library: ViewerLibrary): LibrarySets {
  let sets = setsCache.get(library);
  if (!sets) {
    sets = {
      FAVORITE: new Set(library.FAVORITE),
      WATCHED: new Set(library.WATCHED),
      WATCHLIST: new Set(library.WATCHLIST),
    };
    setsCache.set(library, sets);
  }
  return sets;
}

export function useViewerLibrary() {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: listsKeys.library,
    queryFn: async () => {
      const result = await getViewerLibraryAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    select: toSets,
    // Usually already seeded by the time the session resolves, so this rarely fetches.
    enabled: Boolean(session?.user),
    staleTime: 5 * 60_000,
  });
}

export function useIsInLibrary(listType: SystemListType, tmdbId: number, mediaType: ListMediaType): boolean {
  const { data } = useViewerLibrary();
  return data?.[listType].has(toFavoritedKey(tmdbId, mediaType)) ?? false;
}

function setInLibrary(
  queryClient: ReturnType<typeof useQueryClient>,
  listType: SystemListType,
  key: string,
  present: boolean,
) {
  queryClient.setQueryData<ViewerLibrary>(listsKeys.library, (prev) => {
    if (!prev) return prev;
    const without = prev[listType].filter((k) => k !== key);
    return { ...prev, [listType]: present ? [...without, key] : without };
  });
}

export function useUserLists() {
  return useQuery({
    queryKey: listsKeys.all,
    queryFn: async () => {
      const result = await getUserListsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useUserListsWithPreview() {
  return useQuery({
    queryKey: listsKeys.withPreview,
    queryFn: async () => {
      const result = await getUserListsWithPreviewAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
}

export function useItemListMembership(tmdbId: number, mediaType: ListMediaType, enabled: boolean) {
  return useQuery({
    queryKey: listsKeys.membership(tmdbId, mediaType),
    queryFn: async () => {
      const result = await getItemListIdsAction(tmdbId, mediaType);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled,
  });
}

/** Optimistically flips the title in the library, then settles on the server's answer. */
export function useToggleQuickList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ToggleQuickListInput) => toggleQuickList(input),
    onMutate: ({ listType, tmdbId, mediaType }) => {
      const key = toFavoritedKey(tmdbId, mediaType);
      const wasActive = queryClient.getQueryData<ViewerLibrary>(listsKeys.library)?.[listType].includes(key) ?? false;
      setInLibrary(queryClient, listType, key, !wasActive);
      return { key, wasActive };
    },
    onError: (_err, { listType }, context) => {
      if (context) setInLibrary(queryClient, listType, context.key, context.wasActive);
    },
    onSuccess: (result, { listType }, context) => {
      if (!result.success) {
        setInLibrary(queryClient, listType, context.key, context.wasActive);
        return;
      }
      setInLibrary(queryClient, listType, context.key, result.data.added);
      invalidateAllListQueries(queryClient);
    },
  });
}

export function useAddItemToList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddToListInput) => addItemToList(input),
    onSuccess: (result, variables) => {
      if (result.success) {
        invalidateAllListQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: listsKeys.library });
        queryClient.invalidateQueries({
          queryKey: listsKeys.membership(variables.tmdbId, variables.mediaType),
        });
      }
    },
  });
}

export function useRemoveItemFromList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RemoveFromListInput) => removeItemFromList(input),
    onSuccess: (result, variables) => {
      if (result.success) {
        invalidateAllListQueries(queryClient);
        queryClient.invalidateQueries({ queryKey: listsKeys.library });
        queryClient.invalidateQueries({
          queryKey: listsKeys.membership(variables.tmdbId, variables.mediaType),
        });
      }
    },
  });
}

export function useCreateCustomList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListInput) => createCustomList(input),
    onSuccess: (result) => {
      if (result.success) invalidateAllListQueries(queryClient);
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateListInput) => updateList(input),
    onSuccess: (result) => {
      if (result.success) invalidateAllListQueries(queryClient);
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DeleteListInput) => deleteList(input),
    onSuccess: (result) => {
      if (result.success) invalidateAllListQueries(queryClient);
    },
  });
}

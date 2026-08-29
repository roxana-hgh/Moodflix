"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addItemToList,
  removeItemFromList,
  toggleQuickList,
  createCustomList,
  getUserListsAction,
  getItemListIdsAction,
  getFavoritedKeysAction,
} from "./actions";
import type { AddToListInput, RemoveFromListInput, ToggleQuickListInput, CreateListInput } from "./schema";
import type { ListMediaType } from "./types";

export const listsKeys = {
  all: ["lists"] as const,
  membership: (tmdbId: number, mediaType: ListMediaType) =>
    ["lists", "membership", tmdbId, mediaType] as const,
};

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

export function useToggleQuickList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ToggleQuickListInput) => toggleQuickList(input),
    onSuccess: (result) => {
      if (result.success) queryClient.invalidateQueries({ queryKey: listsKeys.all });
    },
  });
}

export function useAddItemToList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddToListInput) => addItemToList(input),
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: listsKeys.all });
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
        queryClient.invalidateQueries({ queryKey: listsKeys.all });
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
      if (result.success) queryClient.invalidateQueries({ queryKey: listsKeys.all });
    },
  });
}

/** Imperative fetch (not a query) — used to pull favorite status for newly-loaded pages of an infinite grid. */
export function useFetchFavoritedKeys() {
  return useMutation({
    mutationFn: (items: { tmdbId: number; mediaType: ListMediaType }[]) => getFavoritedKeysAction(items),
  });
}
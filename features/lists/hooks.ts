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
  getFavoritedKeysAction,
} from "./actions";
import type {
  AddToListInput,
  RemoveFromListInput,
  ToggleQuickListInput,
  CreateListInput,
  UpdateListInput,
  DeleteListInput,
} from "./schema";
import type { ListMediaType } from "./types";

export const listsKeys = {
  all: ["lists"] as const,
  withPreview: ["lists", "withPreview"] as const,
  membership: (tmdbId: number, mediaType: ListMediaType) =>
    ["lists", "membership", tmdbId, mediaType] as const,
};

function invalidateAllListQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: listsKeys.all });
  queryClient.invalidateQueries({ queryKey: listsKeys.withPreview });
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

export function useToggleQuickList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ToggleQuickListInput) => toggleQuickList(input),
    onSuccess: (result) => {
      if (result.success) invalidateAllListQueries(queryClient);
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

export function useFetchFavoritedKeys() {
  return useMutation({
    mutationFn: (items: { tmdbId: number; mediaType: ListMediaType }[]) => getFavoritedKeysAction(items),
  });
}
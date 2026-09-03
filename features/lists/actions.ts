"use server";

import { revalidatePath } from "next/cache";
import { auth, getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/services/db/prisma";
import {
  createListSchema,
  addToListSchema,
  removeFromListSchema,
  toggleQuickListSchema,
  updateListSchema,
  deleteListSchema,
  type CreateListInput,
  type AddToListInput,
  type RemoveFromListInput,
  type ToggleQuickListInput,
  type UpdateListInput,
  type DeleteListInput,
} from "./schema";
import { toListSummary, type ListSummary, type ListMediaType, type ListWithPreview } from "./types";
import { getItemListIds, getFavoritedKeys, getUserListsWithPreview, getWatchedKeys } from "./queries";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("You must be signed in to manage lists.");
  }
  return userId;
}

function revalidateListPaths(listId?: string) {
  revalidatePath("/lists");
  revalidatePath("/watchlist");
  revalidatePath("/favorites");
  revalidatePath("/watched");
  revalidatePath("/profile");
  if (listId) revalidatePath(`/lists/${listId}`);
}

export async function createCustomList(input: CreateListInput): Promise<ActionResult<ListSummary>> {
  const userId = await requireUserId();
  const parsed = createListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const list = await prisma.list.create({
    data: { userId, type: "CUSTOM", name: parsed.data.name, isPublic: parsed.data.isPublic },
    include: { _count: { select: { items: true } } },
  });

  revalidateListPaths();
  return { success: true, data: toListSummary(list) };
}

export async function updateList(input: UpdateListInput): Promise<ActionResult<ListSummary>> {
  const userId = await requireUserId();
  const parsed = updateListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { listId, name, isPublic } = parsed.data;

  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return { success: false, error: "List not found." };
  if (list.type !== "CUSTOM") return { success: false, error: "Default lists can't be renamed." };

  const updated = await prisma.list.update({
    where: { id: listId },
    data: { name: name.trim(), isPublic },
    include: { _count: { select: { items: true } } },
  });

  revalidateListPaths(listId);
  return { success: true, data: toListSummary(updated) };
}

export async function deleteList(input: DeleteListInput): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = deleteListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { listId } = parsed.data;

  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return { success: false, error: "List not found." };
  if (list.type !== "CUSTOM") return { success: false, error: "Default lists can't be deleted." };

  await prisma.list.delete({ where: { id: listId } });

  revalidateListPaths(listId);
  return { success: true, data: undefined };
}

export async function addItemToList(input: AddToListInput): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = addToListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { listId, tmdbId, mediaType, title, posterPath, releaseYear } = parsed.data;

  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return { success: false, error: "List not found." };

  await prisma.listItem.upsert({
    where: { listId_tmdbId_mediaType: { listId, tmdbId, mediaType } },
    create: { listId, tmdbId, mediaType, title, posterPath, releaseYear: releaseYear ?? null },
    update: {},
  });

  revalidateListPaths(listId);
  return { success: true, data: undefined };
}

export async function removeItemFromList(input: RemoveFromListInput): Promise<ActionResult> {
  const userId = await requireUserId();
  const parsed = removeFromListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { listId, tmdbId, mediaType } = parsed.data;

  const list = await prisma.list.findFirst({ where: { id: listId, userId } });
  if (!list) return { success: false, error: "List not found." };

  await prisma.listItem.deleteMany({ where: { listId, tmdbId, mediaType } });

  revalidateListPaths(listId);
  return { success: true, data: undefined };
}

export async function toggleQuickList(
  input: ToggleQuickListInput
): Promise<ActionResult<{ added: boolean }>> {
  const userId = await requireUserId();
  const parsed = toggleQuickListSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
  const { listType, tmdbId, mediaType, title, posterPath, releaseYear } = parsed.data;

  const list = await prisma.list.findFirst({ where: { userId, type: listType } });
  if (!list) return { success: false, error: `Default ${listType} list not found.` };

  const existing = await prisma.listItem.findUnique({
    where: { listId_tmdbId_mediaType: { listId: list.id, tmdbId, mediaType } },
  });

  if (existing) {
    await prisma.listItem.delete({ where: { id: existing.id } });
    revalidateListPaths(list.id);
    return { success: true, data: { added: false } };
  }

  await prisma.listItem.create({
    data: { listId: list.id, tmdbId, mediaType, title, posterPath, releaseYear: releaseYear ?? null },
  });
  revalidateListPaths(list.id);
  return { success: true, data: { added: true } };
}

export async function getUserListsAction(): Promise<ActionResult<ListSummary[]>> {
  const userId = await requireUserId();
  const lists = await prisma.list.findMany({
    where: { userId },
    include: { _count: { select: { items: true } } },
    orderBy: [{ type: "asc" }, { createdAt: "asc" }],
  });
  return { success: true, data: lists.map(toListSummary) };
}

export async function getUserListsWithPreviewAction(): Promise<ActionResult<ListWithPreview[]>> {
  const userId = await requireUserId();
  const lists = await getUserListsWithPreview(userId);
  return { success: true, data: lists };
}

export async function getItemListIdsAction(
  tmdbId: number,
  mediaType: ListMediaType
): Promise<ActionResult<string[]>> {
  const userId = await requireUserId();
  const listIds = await getItemListIds(userId, tmdbId, mediaType);
  return { success: true, data: listIds };
}

export async function getFavoritedKeysAction(
  items: { tmdbId: number; mediaType: ListMediaType }[]
): Promise<ActionResult<string[]>> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: true, data: [] };
  const keys = await getFavoritedKeys(userId, items);
  return { success: true, data: Array.from(keys) };
}

export async function getWatchedKeysAction(
  items: { tmdbId: number; mediaType: ListMediaType }[]
): Promise<ActionResult<string[]>> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: true, data: [] };
  const keys = await getWatchedKeys(userId, items);
  return { success: true, data: Array.from(keys) };
}
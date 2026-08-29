"use server";

import { revalidatePath } from "next/cache";
import { auth, getCurrentUserId } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/services/db/prisma";
import {
  createListSchema,
  addToListSchema,
  removeFromListSchema,
  toggleQuickListSchema,
  type CreateListInput,
  type AddToListInput,
  type RemoveFromListInput,
  type ToggleQuickListInput,
} from "./schema";
import { toListSummary, type ListSummary, type ListMediaType } from "./types";
import { getItemListIds, getFavoritedKeys, toFavoritedKey, getItemListMembership } from "./queries";

type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string };

async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("You must be signed in to manage lists.");
  }
  return userId;
}

function revalidateListPaths() {
  revalidatePath("/lists");
  revalidatePath("/watchlist");
  revalidatePath("/favorites");
  revalidatePath("/profile");
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

  revalidateListPaths();
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

  revalidateListPaths();
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
    revalidateListPaths();
    return { success: true, data: { added: false } };
  }

  await prisma.listItem.create({
    data: { listId: list.id, tmdbId, mediaType, title, posterPath, releaseYear: releaseYear ?? null },
  });
  revalidateListPaths();
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

export async function getItemListIdsAction(
  tmdbId: number,
  mediaType: ListMediaType
): Promise<ActionResult<string[]>> {
  const userId = await requireUserId();
  const listIds = await getItemListIds(userId, tmdbId, mediaType);
  return { success: true, data: listIds };
}

/**
 * Non-throwing on purpose: called for logged-out users too (buttons render either way),
 * just returns an empty set instead of erroring.
 */
export async function getFavoritedKeysAction(
  items: { tmdbId: number; mediaType: ListMediaType }[]
): Promise<ActionResult<string[]>> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: true, data: [] };
  const keys = await getFavoritedKeys(userId, items);
  return { success: true, data: Array.from(keys) };
}

export async function getItemListMembershipAction(
  tmdbId: number,
  mediaType: ListMediaType
): Promise<ActionResult<{ favorited: boolean; watchlisted: boolean }>> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: true, data: { favorited: false, watchlisted: false } };
  const data = await getItemListMembership(userId, tmdbId, mediaType);
  return { success: true, data };
}
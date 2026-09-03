/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import {
  useUserLists,
  useAddItemToList,
  useRemoveItemFromList,
  useCreateCustomList,
  useItemListMembership,
} from "../hooks";
import { toListMediaType } from "../types";

interface AddToListDialogProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  trigger?: ReactNode;
}

const defaultTriggerClassName =
  "h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background";

export function AddToListDialog({
  tmdbId,
  mediaType,
  title,
  posterPath,
  releaseYear,
  trigger,
}: AddToListDialogProps) {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [open, setOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showNewListInput, setShowNewListInput] = useState(false);

  // Local pending selection — diffed against `initialIds` and only committed on Save.
  const [selectedIds, setSelectedIds] = useState<Set<string> | null>(null);
  const [initialIds, setInitialIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const listMediaType = toListMediaType(mediaType);

  const { data: lists, isLoading: listsLoading } = useUserLists();
  const { data: memberListIds, isLoading: membershipLoading } = useItemListMembership(
    tmdbId,
    listMediaType,
    open
  );

  const addItem = useAddItemToList();
  const removeItem = useRemoveItemFromList();
  const createList = useCreateCustomList();

  // Seed local selection from server membership once it loads for this dialog session.
  useEffect(() => {
    if (!open || membershipLoading || selectedIds !== null) return;
    const ids = new Set(memberListIds ?? []);
    setSelectedIds(ids);
    setInitialIds(ids);
  }, [open, membershipLoading, memberListIds, selectedIds]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Discard any unsaved toggles so the next open starts fresh.
      setSelectedIds(null);
      setInitialIds(new Set());
      setShowNewListInput(false);
      setNewListName("");
    }
  }

  const defaultTrigger = (
    <Button type="button" size="icon" variant="secondary" className={defaultTriggerClassName}>
      <Plus className="h-3.5 w-3.5" />
      <span className="sr-only">Add to list</span>
    </Button>
  );
  const triggerNode = trigger ?? defaultTrigger;

  // Logged-out: render the same trigger, clicking redirects instead of opening the dialog.
  if (!sessionLoading && !session?.user) {
    return (
      <span onClick={() => router.push("/login")} className="inline-flex cursor-pointer">
        {triggerNode}
      </span>
    );
  }

  function handleToggleLocal(listId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev ?? []);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  }

  function handleCreateList() {
    if (!newListName.trim()) return;
    createList.mutate(
      { name: newListName.trim(), isPublic: false },
      {
        onSuccess: (result) => {
          if (result.success) {
            setSelectedIds((prev) => new Set([...(prev ?? []), result.data.id]));
            setNewListName("");
            setShowNewListInput(false);
          }
        },
      }
    );
  }

  async function handleSave() {
    if (!selectedIds) return;

    const toAdd = [...selectedIds].filter((id) => !initialIds.has(id));
    const toRemove = [...initialIds].filter((id) => !selectedIds.has(id));

    if (toAdd.length === 0 && toRemove.length === 0) {
      handleOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all([
        ...toAdd.map((listId) =>
          addItem.mutateAsync({ listId, tmdbId, mediaType: listMediaType, title, posterPath, releaseYear })
        ),
        ...toRemove.map((listId) => removeItem.mutateAsync({ listId, tmdbId, mediaType: listMediaType })),
      ]);
      handleOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  }

  const isLoadingLists = listsLoading || membershipLoading || selectedIds === null;
  const hasChanges =
    selectedIds !== null &&
    ([...selectedIds].some((id) => !initialIds.has(id)) || [...initialIds].some((id) => !selectedIds.has(id)));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>

      <DialogContent className="sm:max-w-sm p-3 md:p-4">
        <DialogHeader>
          <DialogTitle className="line-clamp-1 text-base">Save &quot;{title}&quot; to...</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          {isLoadingLists ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading your lists…</p>
          ) : (
            lists?.map((list) => {
              const isSelected = selectedIds?.has(list.id) ?? false;
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleToggleLocal(list.id)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <span>{list.name}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </button>
              );
            })
          )}
        </div>

        {showNewListInput ? (
          <div className="flex items-center gap-2 pt-2">
            <Input
              autoFocus
              placeholder="List name"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            />
            <Button type="button" size="sm" onClick={handleCreateList} disabled={createList.isPending}>
              Create
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="justify-start gap-2 text-sm text-muted-foreground"
            onClick={() => setShowNewListInput(true)}
          >
            <ListPlus className="h-4 w-4" />
            New list
          </Button>
        )}

        <DialogFooter className="pt-2">
          <Button type="button" variant="ghost" size="xs" className="px-5" onClick={() => handleOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} size="xs" className="px-5" disabled={isLoadingLists || isSaving || !hasChanges}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
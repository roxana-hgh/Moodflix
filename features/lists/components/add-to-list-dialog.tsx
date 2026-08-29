"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, ListPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  function handleToggle(listId: string, isMember: boolean) {
    if (isMember) {
      removeItem.mutate({ listId, tmdbId, mediaType: listMediaType });
    } else {
      addItem.mutate({ listId, tmdbId, mediaType: listMediaType, title, posterPath, releaseYear });
    }
  }

  function handleCreateList() {
    if (!newListName.trim()) return;
    createList.mutate(
      { name: newListName.trim(), isPublic: false },
      {
        onSuccess: (result) => {
          if (result.success) {
            handleToggle(result.data.id, false);
            setNewListName("");
            setShowNewListInput(false);
          }
        },
      }
    );
  }

  const memberSet = new Set(memberListIds ?? []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="line-clamp-1 text-base">Save &quot;{title}&quot; to...</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          {listsLoading || membershipLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading your lists…</p>
          ) : (
            lists?.map((list) => {
              const isMember = memberSet.has(list.id);
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => handleToggle(list.id, isMember)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  <span>{list.name}</span>
                  {isMember && <Check className="h-4 w-4 text-primary" />}
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
      </DialogContent>
    </Dialog>
  );
}
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaCardCompact } from "@/components/media/media-card-compact";
import { useRemoveItemFromList } from "../hooks";
import { toListCardItem, type ListItemSummary } from "../types";

interface ListItemsGridProps {
  listId: string;
  items: ListItemSummary[];
  isOwner: boolean;
}

export function ListItemsGrid({ listId, items, isOwner }: ListItemsGridProps) {
  const removeItem = useRemoveItemFromList();

  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">This list is empty.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {items.map((item) => (
        <MediaCardCompact
          key={item.id}
          {...toListCardItem(item)}
          actions={
            isOwner ? (
              <Button
                type="button"
                size="icon"
                variant="secondary"
                disabled={removeItem.isPending}
                onClick={() =>
                  removeItem.mutate({ listId, tmdbId: item.tmdbId, mediaType: item.mediaType })
                }
                className="h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Remove from list</span>
              </Button>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}
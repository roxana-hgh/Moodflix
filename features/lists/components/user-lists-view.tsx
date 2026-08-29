"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ListCardGridPreview } from "./list-card-grid-preview";
import { CreateListDialog } from "./create-list-dialog";
import { useUserListsWithPreview } from "../hooks";

export function UserListsView() {
  const { data: lists, isLoading, isError } = useUserListsWithPreview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Couldn&apos;t load your lists.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {lists?.map((list) => (
        <ListCardGridPreview key={list.id} list={list} />
      ))}
      <CreateListDialog />
    </div>
  );
}
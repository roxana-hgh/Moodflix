import { ListItemsGrid } from "./list-items-grid";
import { EditListDialog } from "./edit-list-dialog";
import { DeleteListDialog } from "./delete-list-dialog";
import { AddRemoveMediaDialog } from "./add-remove-media-dialog";
import { Badge } from "@/components/ui/badge";
import type { ListDetail } from "../types";

interface ListDetailViewProps {
  list: ListDetail;
}

const LIST_TYPE_LABEL: Record<string, string> = {
  WATCHLIST: "Watch Later",
  FAVORITE: "Favorites",
  CUSTOM: "Custom List",
};

export function ListDetailView({ list }: ListDetailViewProps) {
  const isEditable = list.isOwner && list.type === "CUSTOM";

  return (
    <div className="container mx-auto flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{list.name}</h1>
            <Badge variant={list.isPublic ? "secondary" : "outline"}>
              {list.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
            {list.type !== "CUSTOM" && ` · ${LIST_TYPE_LABEL[list.type]}`}
          </p>
        </div>

        {list.isOwner && (
          <div className="flex flex-wrap gap-2">
            <AddRemoveMediaDialog listId={list.id} currentItems={list.items} />
            {isEditable && (
              <>
                <EditListDialog list={list} />
                <DeleteListDialog listId={list.id} listName={list.name} />
              </>
            )}
          </div>
        )}
      </div>

      <ListItemsGrid listId={list.id} items={list.items} isOwner={list.isOwner} />
    </div>
  );
}
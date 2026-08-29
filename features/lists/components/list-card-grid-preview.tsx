import Link from "next/link";
import Image from "next/image";
import { Heart, Bookmark } from "lucide-react";
import { tmdbImageUrl } from "@/utils/image";
import type { ListWithPreview } from "../types";

interface ListCardGridPreviewProps {
  list: ListWithPreview;
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  WATCHLIST: <Bookmark className="h-3.5 w-3.5" />,
  FAVORITE: <Heart className="h-3.5 w-3.5" />,
};

export function ListCardGridPreview({ list }: ListCardGridPreviewProps) {
  const slots = Array.from({ length: 4 }, (_, i) => list.previewPosters[i] ?? null);

  return (
    <Link
      href={`/lists/${list.id}`}
      className="flex flex-col gap-2 rounded-lg border p-3 transition-colors hover:bg-muted/40"
    >
      <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-md">
        {slots.map((posterPath, i) => (
          <div key={i} className="relative aspect-square overflow-hidden bg-muted">
            {posterPath && <Image src={tmdbImageUrl(posterPath)} alt="" fill className="object-cover" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        {TYPE_ICON[list.type]}
        <span className="truncate text-sm font-medium">{list.name}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
      </p>
    </Link>
  );
}
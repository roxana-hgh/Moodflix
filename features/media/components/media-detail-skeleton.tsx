import { Skeleton } from "@/components/ui/skeleton";

/** App Shell for /movie/[id] and /tv/[id]: shown instantly while the title streams in. */
export function MediaDetailSkeleton() {
  return (
    <div className="pb-16 -mt-(--header-height)">
      <div className="relative h-[75vh] min-h-[420px] bg-muted/30">
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 sm:flex-row sm:items-end sm:px-6">
          <Skeleton className="aspect-[2/3] w-32 shrink-0 rounded-xl sm:w-40 lg:w-52" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full max-w-2xl" />
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-8 sm:px-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

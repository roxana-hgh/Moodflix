import { Skeleton } from "@/components/ui/skeleton";

/** Generic loading UI for signed-in pages (profile, lists, reviews). */
export function PageSkeleton({ variant = "grid" }: { variant?: "grid" | "profile" }) {
  return (
    <div className="container mx-auto flex flex-col gap-6 py-8">
      {variant === "profile" ? (
        <div className="flex items-center gap-4">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
        ))}
      </div>
    </div>
  );
}

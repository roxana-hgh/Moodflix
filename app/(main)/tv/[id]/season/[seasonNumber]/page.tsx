import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { EpisodeAccordion } from "@/features/media/components/episode-accordion";
import { SeasonHeader } from "@/features/media/components/season-header";
import { getSeasonDetail } from "@/features/media/queries";

export const instant = true;

type Props = PageProps<"/tv/[id]/season/[seasonNumber]">;

export default function SeasonPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Suspense fallback={<SeasonSkeleton />}>
        <Season params={params} />
      </Suspense>
    </div>
  );
}

async function Season({ params }: Pick<Props, "params">) {
  const { id, seasonNumber } = await params;
  const season = await getSeasonDetail(id, seasonNumber);
  if (!season) notFound();

  return (
    <>
      <SeasonHeader season={season} />
      <EpisodeAccordion episodes={season.episodes} />
    </>
  );
}

function SeasonSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Skeleton className="aspect-[2/3] w-28 rounded-lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-lg" />
      ))}
    </div>
  );
}

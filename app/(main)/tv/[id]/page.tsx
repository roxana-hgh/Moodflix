import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaDetailSkeleton } from "@/features/media/components/media-detail-skeleton";
import { MediaDetailView } from "@/features/media/components/media-detail-view";
import { getTrendingTv, getTVDetails } from "@/features/media/queries";

export const instant = true;

/** Prerender this week's trending shows at build; every other id is rendered on first visit and then cached. */
export async function generateStaticParams() {
  const trending = await getTrendingTv("week");
  return trending.slice(0, 10).map((show) => ({ id: String(show.id) }));
}

export async function generateMetadata({ params }: PageProps<"/tv/[id]">): Promise<Metadata> {
  const show = await getTVDetails((await params).id);
  return show ? { title: `${show.title} | Moodflix`, description: show.overview } : { title: "TV Show | Moodflix" };
}

export default function TVPage({ params }: PageProps<"/tv/[id]">) {
  return (
    <Suspense fallback={<MediaDetailSkeleton />}>
      <TVDetail params={params} />
    </Suspense>
  );
}

async function TVDetail({ params }: Pick<PageProps<"/tv/[id]">, "params">) {
  const show = await getTVDetails((await params).id);
  if (!show) notFound();
  return <MediaDetailView detail={show} />;
}

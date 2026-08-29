import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTVDetails } from "@/features/media/queries";
import { MediaDetailView } from "@/features/media/components/media-detail-view";
import { getCurrentUserId } from "@/lib/auth";
import { toListMediaType } from "@/features/lists/types";
import { getItemListMembership } from "@/features/lists/queries";


interface TVPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TVPageProps): Promise<Metadata> {
  const { id } = await params;
  const show = await getTVDetails(id).catch(() => null);
  return show
    ? { title: `${show.title} | Moodflix`, description: show.overview }
    : { title: "TV Show | Moodflix" };
}

export default async function TVPage({ params }: TVPageProps) {
  const { id } = await params;
  const show = await getTVDetails(id).catch(() => null);
  if (!show) notFound();

   const userId = await getCurrentUserId();
  const membership = userId
    ? await getItemListMembership(userId, show.id, toListMediaType(show.mediaType))
    : { favorited: false, watchlisted: false };

  return <MediaDetailView detail={show}  initialFavorited={membership.favorited}
        initialWatchlisted={membership.watchlisted} />;
}
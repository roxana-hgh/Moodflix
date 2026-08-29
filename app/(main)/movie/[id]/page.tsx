import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMovieDetails } from "@/features/media/queries";
import { MediaDetailView } from "@/features/media/components/media-detail-view";
import { getCurrentUserId } from "@/lib/auth";
import { getItemListMembership } from "@/features/lists/queries";
import { toListMediaType } from "@/features/lists/types";

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params;
  const movie = await getMovieDetails(id).catch(() => null);
  return movie
    ? { title: `${movie.title} | Moodflix`, description: movie.overview }
    : { title: "Movie | Moodflix" };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const movie = await getMovieDetails(id).catch(() => null);
  if (!movie) notFound();

   const userId = await getCurrentUserId();
  const membership = userId
    ? await getItemListMembership(userId, movie.id, toListMediaType(movie.mediaType))
    : { favorited: false, watchlisted: false };

  return <MediaDetailView detail={movie} initialFavorited={membership.favorited} initialWatchlisted={membership.watchlisted} />;
}
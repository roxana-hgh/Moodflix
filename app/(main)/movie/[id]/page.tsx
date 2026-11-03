import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MediaDetailSkeleton } from "@/features/media/components/media-detail-skeleton";
import { MediaDetailView } from "@/features/media/components/media-detail-view";
import { getMovieDetails, getTrendingMovies } from "@/features/media/queries";

export const instant = true;

/** Prerender this week's trending titles at build; every other id is rendered on first visit and then cached. */
export async function generateStaticParams() {
  const trending = await getTrendingMovies("week");
  return trending.slice(0, 10).map((movie) => ({ id: String(movie.id) }));
}

export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  const movie = await getMovieDetails((await params).id);
  return movie ? { title: `${movie.title} | Moodflix`, description: movie.overview } : { title: "Movie | Moodflix" };
}

export default function MoviePage({ params }: PageProps<"/movie/[id]">) {
  return (
    <Suspense fallback={<MediaDetailSkeleton />}>
      <MovieDetail params={params} />
    </Suspense>
  );
}

async function MovieDetail({ params }: Pick<PageProps<"/movie/[id]">, "params">) {
  const movie = await getMovieDetails((await params).id);
  if (!movie) notFound();
  return <MediaDetailView detail={movie} />;
}

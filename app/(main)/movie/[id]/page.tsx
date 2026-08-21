import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMovieDetails } from "@/features/media/queries";
import { MediaDetailView } from "@/features/media/components/media-detail-view";

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

  return <MediaDetailView detail={movie} />;
}
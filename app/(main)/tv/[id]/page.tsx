import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTVDetails } from "@/features/media/queries";
import { MediaDetailView } from "@/features/media/components/media-detail-view";

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

  return <MediaDetailView detail={show} />;
}
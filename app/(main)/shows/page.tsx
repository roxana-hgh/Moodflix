import type { Metadata } from "next";
import { DiscoverPage } from "@/features/media/components/discover-page";

export const instant = true;

export const metadata: Metadata = { title: "TV Shows | Moodflix" };

export default function TvShowsPage({ searchParams }: PageProps<"/shows">) {
  return (
    <DiscoverPage
      mediaType="tv"
      title="TV Shows"
      description="Find your next series to get lost in."
      searchParams={searchParams}
    />
  );
}

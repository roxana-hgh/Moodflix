import type { Metadata } from "next";
import { DiscoverPage } from "@/features/media/components/discover-page";

export const instant = true;

export const metadata: Metadata = { title: "Movies | Moodflix" };

export default function MoviesPage({ searchParams }: PageProps<"/movies">) {
  return (
    <DiscoverPage
      mediaType="movie"
      title="Movies"
      description="Find something great to watch."
      searchParams={searchParams}
    />
  );
}

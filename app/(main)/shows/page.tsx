import { getTVGenres } from "@/features/media/queries";
import { TVDiscoverBrowser } from "@/features/media/components/tv-discover-browser";

async function TvShowsPage() {
  const genres = await getTVGenres();

  return (
    <div className="h-full py-5">
      <div className="container h-full mx-auto">
        <div className="flex flex-col h-full justify-end gap-2 min-h-10 lg:min-h-10">
          <h2 className="text-lg lg:text-2xl text-primary font-semibold">TV Shows</h2>
          <p className="text-sm md:text-base text-muted-foreground">Find your next series to get lost in.</p>
        </div>

        <TVDiscoverBrowser genres={genres} />
      </div>
    </div>
  );
}

export default TvShowsPage;
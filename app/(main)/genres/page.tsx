import { getMovieGenres, getTVGenres } from "@/features/media/queries";
import { GenreBrowser } from "@/features/media/components/genre-browser";

async function GenresPage() {
  const [movieGenres, tvGenres] = await Promise.all([getMovieGenres(), getTVGenres()]);

  return (
    <div className="h-full py-5">
      <div className="container h-full mx-auto">
        <div className="flex flex-col h-full justify-end gap-2 min-h-10 lg:min-h-12 px-1">
          <h2 className="text-lg lg:text-2xl text-primary font-semibold">Browse by Genre</h2>
          <p className="text-sm md:text-base text-muted-foreground">Pick a genre, pick a lane.</p>
        </div>

        <GenreBrowser movieGenres={movieGenres} tvGenres={tvGenres} />
      </div>
    </div>
  );
}

export default GenresPage;
import { getMovieGenres } from "@/features/media/queries";
import { MovieDiscoverBrowser } from "@/features/media/components/movie-discover-browser";
import { searchParamsToFilters } from "@/features/media/schema";

interface MoviesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function MoviesPage({ searchParams }: MoviesPageProps) {
  const [genres, params] = await Promise.all([getMovieGenres(), searchParams]);
  const initialFilters = searchParamsToFilters(params);

  return (
    <div className="h-full py-5">
      <div className="container h-full mx-auto">
        <div className="flex flex-col h-full justify-end gap-2 min-h-10 lg:min-h-10">
          <h2 className="text-lg lg:text-2xl text-primary font-semibold">Movies</h2>
          <p className="text-sm md:text-base text-muted-foreground">Find something great to watch.</p>
        </div>

        <MovieDiscoverBrowser genres={genres} initialFilters={initialFilters} />
      </div>
    </div>
  );
}

export default MoviesPage;
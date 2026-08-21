import { getMovieGenres } from "@/features/media/queries";
import { MovieDiscoverBrowser } from "@/features/media/components/movie-discover-browser";

async function MoviesPage() {
    const genres = await getMovieGenres();

    return (

        <div className="h-full py-5 ">
            <div className="container h-full mx-auto">
                <div className="flex flex-col h-full justify-end gap-2 min-h-10 lg:min-h-10">
                    <h2 className="text-lg lg:text-2xl text-primary font-semibold">Movies</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Discover your next favorite movie</p>
                </div>

                <MovieDiscoverBrowser genres={genres} />
            </div>
        </div>
    );
}

export default MoviesPage;
export interface MediaCardItem {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  releaseYear: string | number | null;
  overview: string;
  mediaType: 'movie' | 'tv';
}
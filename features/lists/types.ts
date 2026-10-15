import type { List, ListItem } from "@/lib/generated/prisma/client";

export type ListType = "WATCHLIST" | "FAVORITE" | "WATCHED" | "CUSTOM";
export type ListMediaType = "MOVIE" | "TV";

export interface ListSummary {
  id: string;
  type: ListType;
  name: string;
  isPublic: boolean;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListItemSummary {
  id: string;
  tmdbId: number;
  mediaType: ListMediaType;
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  genreIds: number[];
  runtimeMinutes: number | null;
  voteAverage: number | null;
  addedAt: Date;
}

export interface ListCardItem {
  id: number;
  title: string;
  posterPath: string | null;
  releaseYear: string | null;
  mediaType: "movie" | "tv";
}

export interface ListDetail extends ListSummary {
  items: ListItemSummary[];
  isOwner: boolean;
}

// Powers the "all lists" grid — a few poster thumbnails instead of full item data.
export interface ListWithPreview extends ListSummary {
  previewPosters: (string | null)[];
}

type ListWithCount = List & { _count: { items: number } };
type ListWithItems = List & { items: ListItem[] };
type ListWithPreviewItems = List & {
  _count: { items: number };
  items: { posterPath: string | null }[];
};

const TYPE_PRIORITY: Record<ListType, number> = {
  WATCHLIST: 0,
  FAVORITE: 1,
  WATCHED: 2,
  CUSTOM: 3,
};

export function toListSummary(list: ListWithCount): ListSummary {
  return {
    id: list.id,
    type: list.type as ListType,
    name: list.name,
    isPublic: list.isPublic,
    itemCount: list._count.items,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };
}

export function toListItemSummary(item: ListItem): ListItemSummary {
  return {
    id: item.id,
    tmdbId: item.tmdbId,
    mediaType: item.mediaType as ListMediaType,
    title: item.title,
    posterPath: item.posterPath,
    releaseYear: item.releaseYear,
    genreIds: item.genreIds,
    runtimeMinutes: item.runtimeMinutes,
    voteAverage: item.voteAverage,
    addedAt: item.addedAt,
  };
}

export function toListCardItem(item: ListItemSummary): ListCardItem {
  return {
    id: item.tmdbId,
    title: item.title,
    posterPath: item.posterPath,
    releaseYear: item.releaseYear,
    mediaType: item.mediaType === "MOVIE" ? "movie" : "tv",
  };
}

export function toListDetail(
  list: ListWithItems,
  isOwner: boolean,
): ListDetail {
  return {
    id: list.id,
    type: list.type as ListType,
    name: list.name,
    isPublic: list.isPublic,
    itemCount: list.items.length,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    items: list.items.map(toListItemSummary),
    isOwner,
  };
}

export function toListWithPreview(list: ListWithPreviewItems): ListWithPreview {
  return {
    id: list.id,
    type: list.type as ListType,
    name: list.name,
    isPublic: list.isPublic,
    itemCount: list._count.items,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    previewPosters: list.items.map((i) => i.posterPath),
  };
}

export function sortListsForDisplay<
  T extends { type: ListType; createdAt: Date },
>(lists: T[]): T[] {
  return [...lists].sort((a, b) => {
    const priorityDiff = TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type];
    if (priorityDiff !== 0) return priorityDiff;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });
}

export function toListMediaType(mediaType: "movie" | "tv"): ListMediaType {
  return mediaType.toUpperCase() as ListMediaType;
}

export function toFavoritedKey(
  tmdbId: number,
  mediaType: ListMediaType,
): string {
  return `${mediaType}-${tmdbId}`;
}

export interface GenreStat {
  genreId: number;
  mediaType: ListMediaType;
  count: number;
}

export interface GenreStatView {
  name: string;
  count: number;
}
export type StatsScope = "all" | "movie" | "tv";

export interface ChartDatum {
  label: string;
  value: number;
  full?: string;
}

type ByScope = Record<StatsScope, ChartDatum[]>;
type GenreRef = { id: number; name: string };

export interface GenreStatView {
  name: string;
  count: number;
}

export interface WatchedStats {
  total: number;
  movies: number;
  shows: number;
  thisMonth: number;
  topGenre: string | null;
  totalMinutes: number;
  movieMinutes: number;
  tvMinutes: number;
  avgRating: number | null;
  genres: { all: GenreStatView[]; movie: GenreStatView[]; tv: GenreStatView[] };
}

export function withGenreNames(
  stats: GenreStat[],
  movieGenres: GenreRef[],
  tvGenres: GenreRef[],
): GenreStatView[] {
  const names = {
    MOVIE: new Map(movieGenres.map((g) => [g.id, g.name])),
    TV: new Map(tvGenres.map((g) => [g.id, g.name])),
  };

  const totals = new Map<string, number>();
  for (const s of stats) {
    const name = names[s.mediaType].get(s.genreId);
    if (!name) continue;
    totals.set(name, (totals.get(name) ?? 0) + s.count);
  }

  return [...totals]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildWatchedStats(
  items: ListItemSummary[],
  movieGenres: GenreRef[],
  tvGenres: GenreRef[],
  now = new Date(),
): WatchedStats {
  const names = {
    MOVIE: new Map(movieGenres.map((g) => [g.id, g.name])),
    TV: new Map(tvGenres.map((g) => [g.id, g.name])),
  };
  const buckets = {
    all: new Map<string, number>(),
    movie: new Map<string, number>(),
    tv: new Map<string, number>(),
  };

  let movies = 0;
  let shows = 0;
  let thisMonth = 0;
  let movieMinutes = 0;
  let tvMinutes = 0;
  let ratingSum = 0;
  let ratingCount = 0;

  for (const item of items) {
    const isMovie = item.mediaType === "MOVIE";
    if (isMovie) movies++;
    else shows++;

    if (
      item.addedAt.getFullYear() === now.getFullYear() &&
      item.addedAt.getMonth() === now.getMonth()
    ) {
      thisMonth++;
    }

    if (item.runtimeMinutes) {
      if (isMovie) movieMinutes += item.runtimeMinutes;
      else tvMinutes += item.runtimeMinutes;
    }
    if (item.voteAverage) {
      ratingSum += item.voteAverage;
      ratingCount++;
    }

    for (const id of item.genreIds) {
      const name = names[item.mediaType].get(id);
      if (!name) continue;
      for (const bucket of [
        buckets.all,
        isMovie ? buckets.movie : buckets.tv,
      ]) {
        bucket.set(name, (bucket.get(name) ?? 0) + 1);
      }
    }
  }

  const toSorted = (m: Map<string, number>): GenreStatView[] =>
    [...m]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const genres = {
    all: toSorted(buckets.all),
    movie: toSorted(buckets.movie),
    tv: toSorted(buckets.tv),
  };

  return {
    total: items.length,
    movies,
    shows,
    thisMonth,
    topGenre: genres.all[0]?.name ?? null,
    genres,
    totalMinutes: movieMinutes + tvMinutes,
    movieMinutes,
    tvMinutes,
    avgRating: ratingCount ? ratingSum / ratingCount : null,
  };
}


export interface WatchedCharts {
  genres: ByScope;
  decades: ByScope;
  monthly: ByScope; // ساعت، ۱۲ ماه اخیر
  yearly: ByScope;  // ساعت، هر سال
}

const SCOPES: StatsScope[] = ["all", "movie", "tv"];
const round1 = (n: number) => Math.round(n * 10) / 10;

export function buildWatchedCharts(
  items: ListItemSummary[],
  movieGenres: { id: number; name: string }[],
  tvGenres: { id: number; name: string }[],
  now = new Date()
): WatchedCharts {
  const genreNames = {
    MOVIE: new Map(movieGenres.map((g) => [g.id, g.name])),
    TV: new Map(tvGenres.map((g) => [g.id, g.name])),
  };

  const makeBuckets = () => ({
    all: new Map<string, number>(),
    movie: new Map<string, number>(),
    tv: new Map<string, number>(),
  });
  const genres = makeBuckets();
  const decades = makeBuckets();
  const monthly = makeBuckets();
  const yearly = makeBuckets();

  const add = (m: Map<string, number>, key: string, n: number) =>
    m.set(key, (m.get(key) ?? 0) + n);

  for (const item of items) {
    const scopes: StatsScope[] = item.mediaType === "MOVIE" ? ["all", "movie"] : ["all", "tv"];
    const hours = (item.runtimeMinutes ?? 0) / 60;
    const year = item.addedAt.getFullYear();
    const month = item.addedAt.getMonth();
    const releaseYear = parseInt(item.releaseYear ?? "", 10);
    const hasYear = Number.isFinite(releaseYear) && releaseYear > 1800;

    for (const scope of scopes) {
      for (const id of item.genreIds) {
        const name = genreNames[item.mediaType].get(id);
        if (name) add(genres[scope], name, 1);
      }
      if (hasYear) add(decades[scope], String(Math.floor(releaseYear / 10) * 10), 1);
      add(monthly[scope], `${year}-${month}`, hours);
      add(yearly[scope], String(year), hours);
    }
  }

  const byScope = (fn: (scope: StatsScope) => ChartDatum[]): ByScope => ({
    all: fn("all"),
    movie: fn("movie"),
    tv: fn("tv"),
  });

  return {
    genres: byScope((s) =>
      [...genres[s]]
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    ),

    decades: byScope((s) =>
      [...decades[s]]
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([d, value]) => ({ label: `${d}s`, value }))
    ),

    monthly: byScope((s) =>
      Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        return {
          label: d.toLocaleDateString("en-US", { month: "short" }),
          full: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          value: round1(monthly[s].get(`${d.getFullYear()}-${d.getMonth()}`) ?? 0),
        };
      })
    ),

    yearly: byScope((s) => {
      const years = [...yearly[s].keys()].map(Number);
      const start = years.length ? Math.min(...years) : now.getFullYear();
      return Array.from({ length: now.getFullYear() - start + 1 }, (_, i) => {
        const y = start + i;
        return { label: String(y), value: round1(yearly[s].get(String(y)) ?? 0) };
      });
    }),
  };
}

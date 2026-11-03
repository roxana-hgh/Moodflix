import type { NextConfig } from "next";

const HOUR = 60 * 60;
const DAY = 24 * HOUR;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // Named lifetimes for `cacheLife()`. TMDB content changes slowly, so these are
  // deliberately long; the `revalidate` values mirror `TMDB_REVALIDATE` in
  // services/tmdb/cache.ts so the in-memory and fetch caches expire together.
  cacheLife: {
    // trending, popular, top rated, discover pages
    "tmdb-list": { stale: 5 * 60, revalidate: HOUR, expire: DAY },
    // movie, tv, season and person details
    "tmdb-detail": { stale: 15 * 60, revalidate: 12 * HOUR, expire: 7 * DAY },
    // genre lists, keyword ids: effectively static
    "tmdb-static": { stale: HOUR, revalidate: 7 * DAY, expire: 30 * DAY },
    // public Moodflix data (ratings, review feeds), invalidated on write with updateTag
    "db-public": { stale: 60, revalidate: 5 * 60, expire: HOUR },
  },
   allowedDevOrigins: ['192.168.0.109'],

  images: {
    // A TMDB image path never changes content, so optimized variants can live long.
    minimumCacheTTL: 31 * DAY,
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/t/p/**" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;

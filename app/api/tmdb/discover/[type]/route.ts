import type { NextRequest } from "next/server";
import { z } from "zod";
import { discoverMovies, discoverTVShows } from "@/features/media/queries";
import { searchParamsToFilters } from "@/features/media/schema";
import { errorJson, publicJson } from "@/lib/api/cache-control";

const typeSchema = z.enum(["movie", "tv"]);
// TMDB rejects pages past 500
const pageSchema = z.coerce.number().int().min(1).max(500).catch(1);

/**
 * Accepts the same filter params as the /movies and /shows URLs, not raw TMDB
 * params, so the client can't use this route to reach arbitrary TMDB endpoints.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/tmdb/discover/[type]">) {
  const type = typeSchema.safeParse((await ctx.params).type);
  if (!type.success) return errorJson("Invalid media type", 400);

  const search = request.nextUrl.searchParams;
  const filters = searchParamsToFilters(Object.fromEntries(search.entries()));
  const page = pageSchema.parse(search.get("page") ?? 1);

  try {
    const data = type.data === "movie" ? await discoverMovies(filters, page) : await discoverTVShows(filters, page);
    return publicJson(data, { maxAge: 300, sMaxAge: 3600 });
  } catch (err) {
    console.error("[api/tmdb/discover]", err);
    return errorJson("Failed to fetch from TMDB", 502);
  }
}

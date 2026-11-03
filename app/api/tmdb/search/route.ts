import type { NextRequest } from "next/server";
import { z } from "zod";
import { searchMedia } from "@/features/media/queries";
import { errorJson, publicJson } from "@/lib/api/cache-control";

const querySchema = z.string().trim().min(2).max(100);

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(request.nextUrl.searchParams.get("query"));
  if (!parsed.success) return errorJson("Invalid query", 400);

  try {
    // Lowercase so "Dune" and "dune" share one cache entry.
    const results = await searchMedia(parsed.data.toLowerCase());
    return publicJson(results, { maxAge: 300, sMaxAge: 3600 });
  } catch (err) {
    console.error("[api/tmdb/search]", err);
    return errorJson("Failed to fetch from TMDB", 502);
  }
}

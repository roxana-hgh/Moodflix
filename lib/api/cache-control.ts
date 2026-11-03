import "server-only";
import { NextResponse } from "next/server";

/**
 * JSON response that the browser and any CDN may cache. TMDB data is the same
 * for every user, so repeat requests never need to reach the server.
 */
export function publicJson(data: unknown, { maxAge, sMaxAge }: { maxAge: number; sMaxAge: number }) {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${sMaxAge}, stale-while-revalidate=${sMaxAge * 24}`,
    },
  });
}

export function errorJson(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/services/tmdb/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const endpoint = `/${path.join("/")}`;

  // Forward every query param as-is — search needs `query`, trending/discover
  // may need `page`, `language`, etc. The proxy shouldn't hardcode which ones matter.
  const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const data = await serverApi(endpoint, { params: searchParams });
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/tmdb] proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch from TMDB" }, { status: 502 });
  }
}
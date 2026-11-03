import { z } from "zod";
import { getMediaCast } from "@/features/media/queries";
import { errorJson, publicJson } from "@/lib/api/cache-control";

const paramsSchema = z.object({
  type: z.enum(["movie", "tv"]),
  id: z.coerce.number().int().positive(),
});

export async function GET(_req: Request, ctx: RouteContext<"/api/tmdb/[type]/[id]/cast">) {
  const parsed = paramsSchema.safeParse(await ctx.params);
  if (!parsed.success) return errorJson("Invalid params", 400);

  try {
    const cast = await getMediaCast(parsed.data.type, parsed.data.id);
    return publicJson(cast, { maxAge: 3600, sMaxAge: 12 * 3600 });
  } catch (err) {
    console.error("[api/tmdb/cast]", err);
    return errorJson("Failed to fetch from TMDB", 502);
  }
}

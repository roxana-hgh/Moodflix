import { getMediaCast } from "@/features/media/queries";
import { NextResponse } from "next/server";
import { z } from "zod";


const paramsSchema = z.object({
  type: z.enum(["movie", "tv"]),
  id: z.coerce.number().int().positive(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ type: string; id: string }> }) {
  const parsed = paramsSchema.safeParse(await ctx.params);
  if (!parsed.success) return NextResponse.json({ error: "Invalid params" }, { status: 400 });

  const cast = await getMediaCast(parsed.data.type, parsed.data.id);
  return NextResponse.json(cast);
}